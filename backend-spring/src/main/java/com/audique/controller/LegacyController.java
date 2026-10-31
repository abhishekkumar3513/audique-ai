package com.audique.controller;

import com.audique.dto.groq.GeneratedFlashcardsResponse;
import com.audique.dto.request.DownloadPdfRequest;
import com.audique.dto.request.SummarizeRequest;
import com.audique.dto.response.LegacySummaryResponse;
import com.audique.dto.response.TranscribeResponse;
import com.audique.entity.Transcript;
import com.audique.service.FlashcardService;
import com.audique.service.PdfService;
import com.audique.service.SummaryService;
import com.audique.service.TranscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
public class LegacyController {

    private final TranscriptionService transcriptionService;
    private final SummaryService summaryService;
    private final FlashcardService flashcardService;
    private final PdfService pdfService;

    @PostMapping("/transcribe")
    public ResponseEntity<TranscribeResponse> transcribe(
            @RequestParam("audio") MultipartFile audioFile
    ) throws IOException {
        log.info("Legacy /transcribe request received: filename={}, size={}",
                audioFile.getOriginalFilename(), audioFile.getSize());

        Transcript transcript = transcriptionService.transcribeAnonymous(
                audioFile.getBytes(),
                audioFile.getOriginalFilename(),
                audioFile.getContentType()
        );

        return ResponseEntity.ok(TranscribeResponse.builder()
                .text(transcript.getFullText())
                .build());
    }

    @PostMapping("/summarize")
    public ResponseEntity<LegacySummaryResponse> summarize(
            @RequestBody SummarizeRequest request
    ) {
        log.info("Legacy /summarize request received");
        String summaryText = summaryService.generateSummaryFromText(request.getText());
        return ResponseEntity.ok(LegacySummaryResponse.builder()
                .summary(summaryText)
                .build());
    }

    @PostMapping("/flashcards")
    public ResponseEntity<GeneratedFlashcardsResponse> flashcards(
            @RequestBody SummarizeRequest request
    ) {
        log.info("Legacy /flashcards request received");
        GeneratedFlashcardsResponse response = flashcardService.generateFlashcardsFromText(request.getText());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/download-pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @RequestBody DownloadPdfRequest request
    ) {
        log.info("Legacy /download-pdf request received");
        byte[] pdfBytes = pdfService.generatePdfFromSummary(request.getSummary());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Lecture_Notes.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

