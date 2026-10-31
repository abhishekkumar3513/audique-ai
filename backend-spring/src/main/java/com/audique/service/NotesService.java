package com.audique.service;

import com.audique.dto.groq.GeneratedNotesResponse;
import com.audique.dto.request.CreateNoteRequest;
import com.audique.dto.request.UpdateNoteRequest;
import com.audique.entity.LectureSession;
import com.audique.entity.Note;
import com.audique.entity.Transcript;
import com.audique.exception.ResourceNotFoundException;
import com.audique.exception.UnauthorizedException;
import com.audique.integration.GroqClient;
import com.audique.repository.NoteRepository;
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
public class NotesService {

    private final LectureService lectureService;
    private final TranscriptRepository transcriptRepository;
    private final NoteRepository noteRepository;
    private final GroqClient groqClient;

    public List<Note> generateNotes(UUID lectureId, String supabaseUserId) {
        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);

        Transcript transcript = transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot generate notes: no transcript found for lecture " + lectureId));

        GeneratedNotesResponse response;
        try {
            response = groqClient.generateNotes(transcript.getFullText());
        } catch (Exception e) {
            log.warn("Groq notes generation failed ({}), generating fallback notes", e.getMessage());
            response = generateFallbackNotes(transcript.getFullText());
        }

        // Replace existing notes for this lecture
        noteRepository.deleteByLectureSessionId(lectureId);

        List<Note> savedNotes = new ArrayList<>();
        if (response != null && response.getNotes() != null) {
            int order = 0;
            for (GeneratedNotesResponse.GeneratedNote gen : response.getNotes()) {
                Note note = Note.builder()
                        .lectureSession(lecture)
                        .heading(gen.getHeading())
                        .content(gen.getContent())
                        .displayOrder(order++)
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build();
                savedNotes.add(noteRepository.save(note));
            }
        }

        log.info("Generated and saved {} notes for lecture {}", savedNotes.size(), lectureId);
        return savedNotes;
    }

    private GeneratedNotesResponse generateFallbackNotes(String text) {
        List<GeneratedNotesResponse.GeneratedNote> list = new ArrayList<>();
        String[] sentences = text.split("[.!?]");
        int idx = 1;
        for (String sentence : sentences) {
            String trimmed = sentence.trim();
            if (trimmed.length() > 15) {
                list.add(GeneratedNotesResponse.GeneratedNote.builder()
                        .heading("Key Point " + idx)
                        .content(trimmed)
                        .build());
                idx++;
                if (idx > 6) break;
            }
        }
        if (list.isEmpty()) {
            list.add(GeneratedNotesResponse.GeneratedNote.builder()
                    .heading("Main Lecture Content")
                    .content(text.trim())
                    .build());
        }
        return GeneratedNotesResponse.builder().notes(list).build();
    }

    @Transactional(readOnly = true)
    public List<Note> getLectureNotes(UUID lectureId, String supabaseUserId) {
        lectureService.getLecture(lectureId, supabaseUserId);
        return noteRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);
    }

    public Note createNote(UUID lectureId, String supabaseUserId, CreateNoteRequest request) {
        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);
        List<Note> existing = noteRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId);
        int nextOrder = existing.size();

        Note note = Note.builder()
                .lectureSession(lecture)
                .heading(request.getHeading())
                .content(request.getContent())
                .displayOrder(nextOrder)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return noteRepository.save(note);
    }

    public Note updateNote(UUID noteId, String supabaseUserId, UpdateNoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        // Ownership check
        if (!note.getLectureSession().getUser().getSupabaseUserId().equals(supabaseUserId)) {
            throw new UnauthorizedException("You do not have permission to modify this note");
        }

        if (request.getHeading() != null) {
            note.setHeading(request.getHeading());
        }
        note.setContent(request.getContent());
        note.setUpdatedAt(Instant.now());

        return noteRepository.save(note);
    }

    public void deleteNote(UUID noteId, String supabaseUserId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));

        if (!note.getLectureSession().getUser().getSupabaseUserId().equals(supabaseUserId)) {
            throw new UnauthorizedException("You do not have permission to delete this note");
        }

        noteRepository.delete(note);
        log.info("Deleted note {}", noteId);
    }
}

