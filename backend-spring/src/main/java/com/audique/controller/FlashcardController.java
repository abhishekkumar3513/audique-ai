package com.audique.controller;

import com.audique.dto.DtoMapper;
import com.audique.dto.request.CreateFlashcardRequest;
import com.audique.dto.request.UpdateFlashcardRequest;
import com.audique.dto.response.FlashcardResponse;
import com.audique.entity.Flashcard;
import com.audique.security.SecurityUtils;
import com.audique.service.FlashcardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class FlashcardController {

    private final FlashcardService flashcardService;
    private final SecurityUtils securityUtils;

    @PostMapping("/api/lectures/{id}/flashcards/generate")
    public ResponseEntity<List<FlashcardResponse>> generateFlashcards(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        log.info("Generating AI flashcards for lecture {} by user {}", id, supabaseUserId);
        List<Flashcard> flashcards = flashcardService.generateFlashcards(id, supabaseUserId);
        return ResponseEntity.ok(flashcards.stream().map(DtoMapper::toFlashcardResponse).toList());
    }

    @GetMapping("/api/lectures/{id}/flashcards")
    public ResponseEntity<List<FlashcardResponse>> getFlashcards(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        List<Flashcard> flashcards = flashcardService.getLectureFlashcards(id, supabaseUserId);
        return ResponseEntity.ok(flashcards.stream().map(DtoMapper::toFlashcardResponse).toList());
    }

    @PostMapping("/api/lectures/{id}/flashcards")
    public ResponseEntity<FlashcardResponse> createFlashcard(
            @PathVariable UUID id,
            @RequestBody @Valid CreateFlashcardRequest request
    ) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Flashcard flashcard = flashcardService.createFlashcard(id, supabaseUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toFlashcardResponse(flashcard));
    }

    @PutMapping("/api/flashcards/{flashcardId}")
    public ResponseEntity<FlashcardResponse> updateFlashcard(
            @PathVariable UUID flashcardId,
            @RequestBody @Valid UpdateFlashcardRequest request
    ) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Flashcard flashcard = flashcardService.updateFlashcard(flashcardId, supabaseUserId, request);
        return ResponseEntity.ok(DtoMapper.toFlashcardResponse(flashcard));
    }

    @DeleteMapping("/api/flashcards/{flashcardId}")
    public ResponseEntity<Void> deleteFlashcard(@PathVariable UUID flashcardId) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        flashcardService.deleteFlashcard(flashcardId, supabaseUserId);
        return ResponseEntity.noContent().build();
    }
}

