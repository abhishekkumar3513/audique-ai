package com.audique.service;

import com.audique.entity.Flashcard;
import com.audique.entity.LectureSession;
import com.audique.entity.Note;
import com.audique.entity.Summary;
import com.audique.repository.FlashcardRepository;
import com.audique.repository.NoteRepository;
import com.audique.repository.SummaryRepository;
import com.audique.repository.TranscriptRepository;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PdfService {

    private final LectureService lectureService;
    private final TranscriptRepository transcriptRepository;
    private final SummaryRepository summaryRepository;
    private final NoteRepository noteRepository;
    private final FlashcardRepository flashcardRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy • HH:mm")
            .withZone(ZoneId.systemDefault());

    public byte[] generateLecturePdf(UUID lectureId, String supabaseUserId) {
        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);
        Optional<Summary> summaryOpt = summaryRepository.findTopByLectureSessionIdOrderByVersionDesc(lectureId);
        List<Note> notes = noteRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);
        List<Flashcard> flashcards = flashcardRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            String createdDate = lecture.getCreatedAt() != null ? DATE_FORMATTER.format(lecture.getCreatedAt()) : DATE_FORMATTER.format(Instant.now());

            // 1. Header Banner
            renderHeaderBanner(document, lecture.getTitle(), createdDate);

            // 2. Summary Section
            if (summaryOpt.isPresent() && !summaryOpt.get().getContent().isBlank()) {
                renderStyledSummary(document, summaryOpt.get().getContent());
            }

            // 3. Notes Section
            if (!notes.isEmpty()) {
                Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(5, 150, 105));
                addSectionHeading(document, "Curated Study Notes", sectionFont, new Color(16, 185, 129));

                Font noteTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, new Color(6, 78, 59));
                Font noteBodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));

                for (Note note : notes) {
                    PdfPTable noteCard = new PdfPTable(1);
                    noteCard.setWidthPercentage(100);
                    noteCard.setSpacingBefore(3f);
                    noteCard.setSpacingAfter(5f);

                    PdfPCell cell = new PdfPCell();
                    cell.setBackgroundColor(new Color(240, 253, 244));
                    cell.setBorder(Rectangle.NO_BORDER);
                    cell.setBorderWidthLeft(3.5f);
                    cell.setBorderColorLeft(new Color(16, 185, 129));
                    cell.setPadding(8f);

                    Paragraph content = new Paragraph();
                    if (note.getHeading() != null && !note.getHeading().isBlank()) {
                        content.add(new Chunk(note.getHeading() + "\n", noteTitleFont));
                    }
                    content.add(new Chunk(note.getContent(), noteBodyFont));
                    cell.addElement(content);
                    noteCard.addCell(cell);
                    document.add(noteCard);
                }
            }

            // 4. Flashcards Section
            if (!flashcards.isEmpty()) {
                Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(217, 70, 239));
                addSectionHeading(document, "Revision Flashcards", sectionFont, new Color(236, 72, 153));

                Font qFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(131, 24, 67));
                Font aFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));

                int idx = 1;
                for (Flashcard card : flashcards) {
                    PdfPTable fcCard = new PdfPTable(1);
                    fcCard.setWidthPercentage(100);
                    fcCard.setSpacingBefore(2f);
                    fcCard.setSpacingAfter(4f);

                    PdfPCell cell = new PdfPCell();
                    cell.setBackgroundColor(new Color(253, 242, 248));
                    cell.setBorder(Rectangle.NO_BORDER);
                    cell.setBorderWidthLeft(3f);
                    cell.setBorderColorLeft(new Color(236, 72, 153));
                    cell.setPadding(7f);

                    Paragraph p = new Paragraph();
                    p.add(new Chunk("Q" + idx + ": " + card.getQuestion() + "\n", qFont));
                    p.add(new Chunk("A: " + card.getAnswer(), aFont));
                    cell.addElement(p);
                    fcCard.addCell(cell);
                    document.add(fcCard);
                    idx++;
                }
            }

            renderFooter(document);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for lecture {}: {}", lectureId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    public byte[] generatePdfFromSummary(String summaryText) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            String currentDate = DATE_FORMATTER.format(Instant.now());

            // 1. Header Banner
            renderHeaderBanner(document, "Lecture Summary & Study Notes", currentDate);

            // 2. Render Rich Formatted Summary
            renderStyledSummary(document, summaryText);

            // 3. Footer
            renderFooter(document);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF from summary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }

    private void renderHeaderBanner(Document document, String title, String date) throws Exception {
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingAfter(12f);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(15, 23, 42)); // Slate 900
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(14f);

        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, new Color(56, 189, 248)); // Cyan 400
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.WHITE);
        Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 8.5f, new Color(148, 163, 184)); // Slate 400

        Paragraph brand = new Paragraph("AUDIQUE  |  AI-POWERED LECTURE STUDY GUIDE", brandFont);
        brand.setSpacingAfter(4f);
        cell.addElement(brand);

        Paragraph mainTitle = new Paragraph(title != null && !title.isBlank() ? title : "Lecture Notes", titleFont);
        mainTitle.setSpacingAfter(6f);
        cell.addElement(mainTitle);

        String metaText = (date != null ? date : DATE_FORMATTER.format(Instant.now())) + "  •  Automated Academic Synthesis";
        Paragraph meta = new Paragraph(metaText, metaFont);
        cell.addElement(meta);

        headerTable.addCell(cell);
        document.add(headerTable);
    }

    private void renderStyledSummary(Document document, String summaryText) throws Exception {
        if (summaryText == null || summaryText.isBlank()) return;

        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(67, 56, 202)); // Indigo 700
        Font conceptTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10.5f, new Color(30, 27, 75)); // Dark Navy
        Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9.5f, new Color(51, 65, 85)); // Slate 700
        Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9.5f, new Color(15, 23, 42)); // Slate 900
        Font bulletMarkerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10f, new Color(14, 165, 233)); // Sky 500

        String[] lines = summaryText.split("\n");
        String currentSection = "overview";

        for (String rawLine : lines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            String lower = line.toLowerCase();

            // Detect section headers
            if (lower.contains("executive overview") || lower.equals("### overview") || lower.equals("## overview")) {
                currentSection = "overview";
                addSectionHeading(document, "Executive Overview", sectionFont, new Color(99, 102, 241));
                continue;
            }
            if (lower.contains("core concept") || lower.contains("key concept") || lower.contains("conceptual theme")) {
                currentSection = "concepts";
                addSectionHeading(document, "Core Conceptual Themes", sectionFont, new Color(168, 85, 247));
                continue;
            }
            if (lower.contains("key takeaway") || lower.contains("takeaway") || lower.contains("key point")) {
                currentSection = "takeaways";
                addSectionHeading(document, "Essential Takeaways", sectionFont, new Color(14, 165, 233));
                continue;
            }

            // Render based on section
            if ("concepts".equals(currentSection)) {
                String conceptTitle = "";
                String conceptDesc = line;

                Pattern pattern = Pattern.compile("^[-*•]?\\s*\\*\\*(.*?)\\*\\*:\\s*(.*)$");
                Matcher m = pattern.matcher(line);
                if (m.find()) {
                    conceptTitle = m.group(1).trim();
                    conceptDesc = m.group(2).trim();
                } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
                    String clean = line.replaceFirst("^[-*•]\\s*", "").trim();
                    int colon = clean.indexOf(":");
                    if (colon > 0 && colon < 45) {
                        conceptTitle = clean.substring(0, colon).trim().replace("**", "");
                        conceptDesc = clean.substring(colon + 1).trim();
                    } else {
                        conceptTitle = "Core Principle";
                        conceptDesc = clean;
                    }
                }

                // Styled Callout Card Box
                PdfPTable card = new PdfPTable(1);
                card.setWidthPercentage(100);
                card.setSpacingBefore(3f);
                card.setSpacingAfter(5f);

                PdfPCell cell = new PdfPCell();
                cell.setBackgroundColor(new Color(248, 250, 252)); // Slate 50
                cell.setBorder(Rectangle.NO_BORDER);
                cell.setBorderWidthLeft(3.5f);
                cell.setBorderColorLeft(new Color(168, 85, 247)); // Purple 500
                cell.setPadding(8f);

                Paragraph cardContent = new Paragraph();
                if (!conceptTitle.isEmpty()) {
                    cardContent.add(new Chunk(conceptTitle + "\n", conceptTitleFont));
                }
                appendFormattedInline(cardContent, conceptDesc, bodyFont, boldBodyFont);
                cell.addElement(cardContent);
                card.addCell(cell);
                document.add(card);

            } else if ("takeaways".equals(currentSection)) {
                String clean = line.replaceFirst("^[#*\\-•\\s\\d.:)]+", "").trim();
                if (clean.length() > 3) {
                    PdfPTable row = new PdfPTable(new float[]{16f, 500f});
                    row.setWidthPercentage(100);
                    row.setSpacingBefore(2f);
                    row.setSpacingAfter(4f);

                    PdfPCell markerCell = new PdfPCell();
                    markerCell.setBorder(Rectangle.NO_BORDER);
                    Paragraph marker = new Paragraph("•", bulletMarkerFont);
                    markerCell.addElement(marker);
                    row.addCell(markerCell);

                    PdfPCell textCell = new PdfPCell();
                    textCell.setBorder(Rectangle.NO_BORDER);
                    Paragraph textPara = new Paragraph();
                    appendFormattedInline(textPara, clean, bodyFont, boldBodyFont);
                    textCell.addElement(textPara);
                    row.addCell(textCell);

                    document.add(row);
                }
            } else {
                // Overview prose paragraph
                String clean = line.replaceFirst("^###?\\s*", "").trim();
                if (!clean.isEmpty()) {
                    Paragraph p = new Paragraph();
                    p.setSpacingAfter(6f);
                    p.setLeading(13.5f);
                    appendFormattedInline(p, clean, bodyFont, boldBodyFont);
                    document.add(p);
                }
            }
        }
    }

    private void addSectionHeading(Document document, String title, Font font, Color barColor) throws Exception {
        PdfPTable headerTable = new PdfPTable(new float[]{4f, 500f});
        headerTable.setWidthPercentage(100);
        headerTable.setSpacingBefore(12f);
        headerTable.setSpacingAfter(6f);

        PdfPCell barCell = new PdfPCell();
        barCell.setBackgroundColor(barColor);
        barCell.setBorder(Rectangle.NO_BORDER);
        headerTable.addCell(barCell);

        PdfPCell textCell = new PdfPCell();
        textCell.setBorder(Rectangle.NO_BORDER);
        textCell.setPaddingLeft(6f);
        textCell.addElement(new Paragraph(title, font));
        headerTable.addCell(textCell);

        document.add(headerTable);
    }

    private void appendFormattedInline(Paragraph p, String text, Font regularFont, Font boldFont) {
        if (text == null) return;
        String[] parts = text.split("(?<=\\*\\*)|(?=\\*\\*)");
        boolean inBold = false;
        for (String part : parts) {
            if ("**".equals(part)) {
                inBold = !inBold;
            } else if (!part.isEmpty()) {
                p.add(new Chunk(part, inBold ? boldFont : regularFont));
            }
        }
    }

    private void renderFooter(Document document) throws Exception {
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(18f);

        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, new Color(148, 163, 184));
        footer.add(new Chunk("Audique AI Study Platform  •  Structured for Academic Retention", footerFont));
        footer.setAlignment(Element.ALIGN_CENTER);

        document.add(footer);
    }
}

