package com.audique.controller;

import com.audique.dto.DtoMapper;
import com.audique.dto.request.CreateNoteRequest;
import com.audique.dto.request.UpdateNoteRequest;
import com.audique.dto.response.NoteResponse;
import com.audique.entity.Note;
import com.audique.security.SecurityUtils;
import com.audique.service.NotesService;
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
public class NotesController {

    private final NotesService notesService;
    private final SecurityUtils securityUtils;

    @PostMapping("/api/lectures/{id}/notes/generate")
    public ResponseEntity<List<NoteResponse>> generateNotes(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        log.info("Generating AI notes for lecture {} by user {}", id, supabaseUserId);
        List<Note> notes = notesService.generateNotes(id, supabaseUserId);
        return ResponseEntity.ok(notes.stream().map(DtoMapper::toNoteResponse).toList());
    }

    @GetMapping("/api/lectures/{id}/notes")
    public ResponseEntity<List<NoteResponse>> getNotes(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        List<Note> notes = notesService.getLectureNotes(id, supabaseUserId);
        return ResponseEntity.ok(notes.stream().map(DtoMapper::toNoteResponse).toList());
    }

    @PostMapping("/api/lectures/{id}/notes")
    public ResponseEntity<NoteResponse> createNote(
            @PathVariable UUID id,
            @RequestBody @Valid CreateNoteRequest request
    ) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Note note = notesService.createNote(id, supabaseUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(DtoMapper.toNoteResponse(note));
    }

    @PutMapping("/api/notes/{noteId}")
    public ResponseEntity<NoteResponse> updateNote(
            @PathVariable UUID noteId,
            @RequestBody @Valid UpdateNoteRequest request
    ) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Note note = notesService.updateNote(noteId, supabaseUserId, request);
        return ResponseEntity.ok(DtoMapper.toNoteResponse(note));
    }

    @DeleteMapping("/api/notes/{noteId}")
    public ResponseEntity<Void> deleteNote(@PathVariable UUID noteId) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        notesService.deleteNote(noteId, supabaseUserId);
        return ResponseEntity.noContent().build();
    }
}

