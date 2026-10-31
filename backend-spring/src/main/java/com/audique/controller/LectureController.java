package com.audique.controller;

import com.audique.dto.DtoMapper;
import com.audique.dto.request.CreateLectureRequest;
import com.audique.dto.request.UpdateLectureRequest;
import com.audique.dto.response.LectureDetailResponse;
import com.audique.dto.response.LectureResponse;
import com.audique.entity.Flashcard;
import com.audique.entity.LectureSession;
import com.audique.entity.Note;
import com.audique.entity.Summary;
import com.audique.entity.Transcript;
import com.audique.repository.FlashcardRepository;
import com.audique.repository.NoteRepository;
import com.audique.repository.SummaryRepository;
import com.audique.repository.TranscriptRepository;
import com.audique.security.SecurityUtils;
import com.audique.service.LectureService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/lectures")
@RequiredArgsConstructor
@Slf4j
public class LectureController {

    private final LectureService lectureService;
    private final TranscriptRepository transcriptRepository;
    private final SummaryRepository summaryRepository;
    private final NoteRepository noteRepository;
    private final FlashcardRepository flashcardRepository;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<LectureResponse> createLecture(@RequestBody @Valid CreateLectureRequest request) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        String email = securityUtils.getUserEmail();
        String name = securityUtils.getUserName();

        LectureSession session = lectureService.createLecture(supabaseUserId, email, name, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toLectureResponse(session));
    }

    @GetMapping
    public ResponseEntity<List<LectureResponse>> getUserLectures() {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        List<LectureSession> sessions = lectureService.getUserLectures(supabaseUserId);
        List<LectureResponse> responses = sessions.stream()
                .map(DtoMapper::toLectureResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LectureDetailResponse> getLectureDetail(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        LectureSession session = lectureService.getLecture(id, supabaseUserId);

        Optional<Transcript> transcript = transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(id);
        Optional<Summary> summary = summaryRepository.findTopByLectureSessionIdOrderByVersionDesc(id);
        List<Note> notes = noteRepository.findByLectureSessionIdOrderByDisplayOrderAsc(id);
        List<Flashcard> flashcards = flashcardRepository.findByLectureSessionIdOrderByDisplayOrderAsc(id);

        LectureDetailResponse response = DtoMapper.toLectureDetailResponse(
                session,
                transcript.orElse(null),
                summary.orElse(null),
                notes,
                flashcards
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LectureResponse> updateLecture(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateLectureRequest request
    ) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        LectureSession session = lectureService.updateLecture(id, supabaseUserId, request);
        return ResponseEntity.ok(DtoMapper.toLectureResponse(session));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLecture(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        lectureService.deleteLecture(id, supabaseUserId);
        return ResponseEntity.noContent().build();
    }
}

