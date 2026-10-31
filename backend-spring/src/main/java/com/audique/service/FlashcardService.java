package com.audique.service;

import com.audique.dto.groq.GeneratedFlashcardsResponse;
import com.audique.dto.request.CreateFlashcardRequest;
import com.audique.dto.request.UpdateFlashcardRequest;
import com.audique.entity.Flashcard;
import com.audique.entity.LectureSession;
import com.audique.entity.Transcript;
import com.audique.exception.ResourceNotFoundException;
import com.audique.exception.UnauthorizedException;
import com.audique.integration.GroqClient;
import com.audique.repository.FlashcardRepository;
import com.audique.repository.TranscriptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FlashcardService {

    private final LectureService lectureService;
    private final TranscriptRepository transcriptRepository;
    private final FlashcardRepository flashcardRepository;
    private final GroqClient groqClient;

    public List<Flashcard> generateFlashcards(UUID lectureId, String supabaseUserId) {
        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);

        Transcript transcript = transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot generate flashcards: no transcript found for lecture " + lectureId));

        GeneratedFlashcardsResponse response;
        try {
            response = groqClient.generateFlashcards(transcript.getFullText());
        } catch (Exception e) {
            log.warn("Groq flashcards generation failed ({}), generating fallback flashcards", e.getMessage());
            response = generateFallbackFlashcards(transcript.getFullText());
        }

        // Replace existing flashcards
        flashcardRepository.deleteByLectureSessionId(lectureId);

        List<Flashcard> savedCards = new ArrayList<>();
        if (response != null && response.getFlashcards() != null) {
            int order = 0;
            for (GeneratedFlashcardsResponse.GeneratedFlashcard gen : response.getFlashcards()) {
                if (isHeader(gen.getQuestion()) || isHeader(gen.getAnswer())) {
                    continue;
                }
                Flashcard card = Flashcard.builder()
                        .lectureSession(lecture)
                        .question(gen.getQuestion())
                        .answer(gen.getAnswer())
                        .displayOrder(order++)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();
                savedCards.add(flashcardRepository.save(card));
            }
        }

        log.info("Generated and saved {} flashcards for lecture {}", savedCards.size(), lectureId);
        return savedCards;
    }

    public GeneratedFlashcardsResponse generateFlashcardsFromText(String text) {
        if (text == null || text.isBlank()) {
            return GeneratedFlashcardsResponse.builder().flashcards(new ArrayList<>()).build();
        }
        try {
            return groqClient.generateFlashcards(text);
        } catch (Exception e) {
            log.warn("Groq flashcards generation from text failed ({}), generating fallback flashcards", e.getMessage());
            return generateFallbackFlashcards(text);
        }
    }

    private boolean isHeader(String text) {
        if (text == null) return true;
        String lower = text.trim().toLowerCase().replaceAll("^[#*\\-•\\s\\d.:)]+", "");
        return lower.length() < 5 ||
                lower.startsWith("overview") ||
                lower.startsWith("key observation") ||
                lower.startsWith("observation") ||
                lower.startsWith("key takeaway") ||
                lower.startsWith("takeaway") ||
                lower.startsWith("lecture summary") ||
                lower.endsWith(":");
    }

    private GeneratedFlashcardsResponse generateFallbackFlashcards(String text) {
        List<GeneratedFlashcardsResponse.GeneratedFlashcard> list = new ArrayList<>();
        String[] sentences = text.split("[.!?]");
        int idx = 1;
        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (trimmed.length() > 20 && !isHeader(trimmed)) {
                String[] words = trimmed.split("\\s+");
                String question = words.length >= 4
                        ? "What does the lecture explain regarding " + words[0].toLowerCase() + " " + words[1].toLowerCase() + " " + words[2].toLowerCase() + "?"
                        : "Key Concept #" + idx;

                list.add(GeneratedFlashcardsResponse.GeneratedFlashcard.builder()
                        .question(question)
                        .answer(trimmed + ".")
                        .build());
                idx++;
                if (idx > 6) break;
            }
        }
        return GeneratedFlashcardsResponse.builder().flashcards(list).build();
    }

    @Transactional(readOnly = true)
    public List<Flashcard> getLectureFlashcards(UUID lectureId, String supabaseUserId) {
        lectureService.getLecture(lectureId, supabaseUserId);
        return flashcardRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);
    }

    public Flashcard createFlashcard(UUID lectureId, String supabaseUserId, CreateFlashcardRequest request) {
        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);
        List<Flashcard> existing = flashcardRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);
        int nextOrder = existing.size();

        Flashcard card = Flashcard.builder()
                .lectureSession(lecture)
                .question(request.getQuestion())
                .answer(request.getAnswer())
                .displayOrder(nextOrder)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return flashcardRepository.save(card);
    }

    public Flashcard updateFlashcard(UUID flashcardId, String supabaseUserId, UpdateFlashcardRequest request) {
        Flashcard card = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard", "id", flashcardId));

        if (!card.getLectureSession().getUser().getSupabaseUserId().equals(supabaseUserId)) {
            throw new UnauthorizedException("You do not have permission to modify this flashcard");
        }

        card.setQuestion(request.getQuestion());
        card.setAnswer(request.getAnswer());
        card.setUpdatedAt(Instant.now());

        return flashcardRepository.save(card);
    }

    public void deleteFlashcard(UUID flashcardId, String supabaseUserId) {
        Flashcard card = flashcardRepository.findById(flashcardId)
                .orElseThrow(() -> new ResourceNotFoundException("Flashcard", "id", flashcardId));

        if (!card.getLectureSession().getUser().getSupabaseUserId().equals(supabaseUserId)) {
            throw new UnauthorizedException("You do not have permission to delete this flashcard");
        }

        flashcardRepository.delete(card);
        log.info("Deleted flashcard {}", flashcardId);
    }
}

