package com.audique.service;

import com.audique.dto.groq.GeneratedNotesResponse;
import com.audique.dto.request.CreateNoteRequest;
import com.audique.dto.request.UpdateNoteRequest;
import com.audique.entity.LectureSession;
import com.audique.entity.Note;
import com.audique.entity.Transcript;
import com.audique.entity.User;
import com.audique.exception.UnauthorizedException;
import com.audique.integration.GroqClient;
import com.audique.repository.NoteRepository;
import com.audique.repository.TranscriptRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotesServiceTest {

    @Mock
    private LectureService lectureService;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private NoteRepository noteRepository;

    @Mock
    private GroqClient groqClient;

    @InjectMocks
    private NotesService notesService;

    private User mockUser;
    private LectureSession mockLecture;
    private Transcript mockTranscript;
    private Note mockNote;
    private UUID lectureId;
    private UUID noteId;
    private final String supabaseUserId = "user-abc-123";

    @BeforeEach
    void setUp() {
        lectureId = UUID.randomUUID();
        noteId = UUID.randomUUID();

        mockUser = User.builder()
                .id(UUID.randomUUID())
                .supabaseUserId(supabaseUserId)
                .email("student@audique.local")
                .build();

        mockLecture = LectureSession.builder()
                .id(lectureId)
                .user(mockUser)
                .title("Database Systems")
                .status("TRANSCRIBED")
                .build();

        mockTranscript = Transcript.builder()
                .id(UUID.randomUUID())
                .lectureSession(mockLecture)
                .fullText("Relational algebra is a formal system for modeling the data stored in relational databases.")
                .build();

        mockNote = Note.builder()
                .id(noteId)
                .lectureSession(mockLecture)
                .heading("Relational Algebra")
                .content("Formal query language for relations.")
                .displayOrder(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void generateNotes_Success() {
        GeneratedNotesResponse genResponse = GeneratedNotesResponse.builder()
                .notes(List.of(
                        GeneratedNotesResponse.GeneratedNote.builder()
                                .heading("Relational Algebra")
                                .content("Formal query language.")
                                .build()
                ))
                .build();

        when(lectureService.getLecture(lectureId, supabaseUserId)).thenReturn(mockLecture);
        when(transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(lectureId))
                .thenReturn(Optional.of(mockTranscript));
        when(groqClient.generateNotes(mockTranscript.getFullText())).thenReturn(genResponse);
        when(noteRepository.save(any(Note.class))).thenReturn(mockNote);

        List<Note> notes = notesService.generateNotes(lectureId, supabaseUserId);

        assertNotNull(notes);
        assertEquals(1, notes.size());
        verify(noteRepository, times(1)).deleteByLectureSessionId(lectureId);
        verify(noteRepository, times(1)).save(any(Note.class));
    }

    @Test
    void getLectureNotes_Success() {
        when(lectureService.getLecture(lectureId, supabaseUserId)).thenReturn(mockLecture);
        when(noteRepository.findByLectureSessionIdOrderByDisplayOrderAsc(lectureId))
                .thenReturn(List.of(mockNote));

        List<Note> notes = notesService.getLectureNotes(lectureId, supabaseUserId);

        assertEquals(1, notes.size());
        assertEquals("Relational Algebra", notes.get(0).getHeading());
    }

    @Test
    void updateNote_Success() {
        UpdateNoteRequest request = new UpdateNoteRequest();
        request.setHeading("Updated Heading");
        request.setContent("Updated Content");

        when(noteRepository.findById(noteId)).thenReturn(Optional.of(mockNote));
        when(noteRepository.save(any(Note.class))).thenReturn(mockNote);

        Note updated = notesService.updateNote(noteId, supabaseUserId, request);

        assertNotNull(updated);
        assertEquals("Updated Heading", mockNote.getHeading());
        assertEquals("Updated Content", mockNote.getContent());
    }

    @Test
    void updateNote_Unauthorized_ThrowsException() {
        UpdateNoteRequest request = new UpdateNoteRequest();
        request.setHeading("Updated Heading");
        request.setContent("Updated Content");

        when(noteRepository.findById(noteId)).thenReturn(Optional.of(mockNote));

        assertThrows(UnauthorizedException.class, () ->
                notesService.updateNote(noteId, "other-user-456", request));
    }
}

