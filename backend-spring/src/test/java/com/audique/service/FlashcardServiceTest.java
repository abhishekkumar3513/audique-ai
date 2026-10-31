package com.audique.service;

import com.audique.dto.groq.GeneratedFlashcardsResponse;
import com.audique.dto.request.CreateFlashcardRequest;
import com.audique.dto.request.UpdateFlashcardRequest;
import com.audique.entity.Flashcard;
import com.audique.entity.LectureSession;
import com.audique.entity.Transcript;
import com.audique.entity.User;
import com.audique.exception.UnauthorizedException;
import com.audique.integration.GroqClient;
import com.audique.repository.FlashcardRepository;
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
class FlashcardServiceTest {

    @Mock
    private LectureService lectureService;

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private FlashcardRepository flashcardRepository;

    @Mock
    private GroqClient groqClient;

    @InjectMocks
    private FlashcardService flashcardService;

    private User mockUser;
    private LectureSession mockLecture;
    private Transcript mockTranscript;
    private Flashcard mockCard;
    private UUID lectureId;
    private UUID cardId;
    private final String supabaseUserId = "user-123";

    @BeforeEach
    void setUp() {
        lectureId = UUID.randomUUID();
        cardId = UUID.randomUUID();

        mockUser = User.builder()
                .id(UUID.randomUUID())
                .supabaseUserId(supabaseUserId)
                .email("student@audique.local")
                .build();

        mockLecture = LectureSession.builder()
                .id(lectureId)
                .user(mockUser)
                .title("Operating Systems")
                .build();

        mockTranscript = Transcript.builder()
                .id(UUID.randomUUID())
                .lectureSession(mockLecture)
                .fullText("A deadlock occurs when a set of processes are blocked.")
                .build();

        mockCard = Flashcard.builder()
                .id(cardId)
                .lectureSession(mockLecture)
                .question("What is a deadlock?")
                .answer("A situation where processes are permanently blocked.")
                .displayOrder(0)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void generateFlashcards_Success() {
        GeneratedFlashcardsResponse response = GeneratedFlashcardsResponse.builder()
                .flashcards(List.of(
                        GeneratedFlashcardsResponse.GeneratedFlashcard.builder()
                                .question("What is a deadlock?")
                                .answer("Processes blocked permanently.")
                                .build()
                ))
                .build();

        when(lectureService.getLecture(lectureId, supabaseUserId)).thenReturn(mockLecture);
        when(transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(lectureId))
                .thenReturn(Optional.of(mockTranscript));
        when(groqClient.generateFlashcards(mockTranscript.getFullText())).thenReturn(response);
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(mockCard);

        List<Flashcard> cards = flashcardService.generateFlashcards(lectureId, supabaseUserId);

        assertNotNull(cards);
        assertEquals(1, cards.size());
        verify(flashcardRepository, times(1)).deleteByLectureSessionId(lectureId);
        verify(flashcardRepository, times(1)).save(any(Flashcard.class));
    }

    @Test
    void updateFlashcard_Success() {
        UpdateFlashcardRequest request = new UpdateFlashcardRequest();
        request.setQuestion("Updated Question?");
        request.setAnswer("Updated Answer.");

        when(flashcardRepository.findById(cardId)).thenReturn(Optional.of(mockCard));
        when(flashcardRepository.save(any(Flashcard.class))).thenReturn(mockCard);

        Flashcard updated = flashcardService.updateFlashcard(cardId, supabaseUserId, request);

        assertNotNull(updated);
        assertEquals("Updated Question?", mockCard.getQuestion());
        assertEquals("Updated Answer.", mockCard.getAnswer());
    }

    @Test
    void updateFlashcard_Unauthorized_ThrowsException() {
        UpdateFlashcardRequest request = new UpdateFlashcardRequest();
        request.setQuestion("Q?");
        request.setAnswer("A.");

        when(flashcardRepository.findById(cardId)).thenReturn(Optional.of(mockCard));

        assertThrows(UnauthorizedException.class, () ->
                flashcardService.updateFlashcard(cardId, "intruder-id", request));
    }
}

