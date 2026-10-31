package com.audique.service;

import com.audique.dto.request.CreateLectureRequest;
import com.audique.dto.request.UpdateLectureRequest;
import com.audique.entity.LectureSession;
import com.audique.entity.User;
import com.audique.exception.ResourceNotFoundException;
import com.audique.integration.SupabaseStorageClient;
import com.audique.repository.LectureRepository;
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
class LectureServiceTest {

    @Mock
    private LectureRepository lectureRepository;

    @Mock
    private UserService userService;

    @Mock
    private SupabaseStorageClient storageClient;

    @InjectMocks
    private LectureService lectureService;

    private User mockUser;
    private LectureSession mockLecture;
    private UUID lectureId;
    private UUID userId;
    private final String supabaseUserId = "supabase-uid-123";

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        lectureId = UUID.randomUUID();

        mockUser = User.builder()
                .id(userId)
                .supabaseUserId(supabaseUserId)
                .email("test@audique.local")
                .name("Test Student")
                .build();

        mockLecture = LectureSession.builder()
                .id(lectureId)
                .user(mockUser)
                .title("Operating Systems Lecture")
                .status("CREATED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }

    @Test
    void createLecture_Success() {
        CreateLectureRequest request = new CreateLectureRequest();
        request.setTitle("Physics 101");

        when(userService.getOrCreateUser(supabaseUserId, "test@audique.local", "Test Student"))
                .thenReturn(mockUser);
        when(lectureRepository.save(any(LectureSession.class))).thenReturn(mockLecture);

        LectureSession result = lectureService.createLecture(supabaseUserId, "test@audique.local", "Test Student", request);

        assertNotNull(result);
        assertEquals("Operating Systems Lecture", result.getTitle());
        verify(lectureRepository, times(1)).save(any(LectureSession.class));
    }

    @Test
    void getUserLectures_Success() {
        when(userService.getUserBySupabaseId(supabaseUserId)).thenReturn(mockUser);
        when(lectureRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(mockLecture));

        List<LectureSession> result = lectureService.getUserLectures(supabaseUserId);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(mockLecture.getId(), result.get(0).getId());
    }

    @Test
    void getLecture_Success() {
        when(userService.getUserBySupabaseId(supabaseUserId)).thenReturn(mockUser);
        when(lectureRepository.findByIdAndUserId(lectureId, userId)).thenReturn(Optional.of(mockLecture));

        LectureSession result = lectureService.getLecture(lectureId, supabaseUserId);

        assertNotNull(result);
        assertEquals(lectureId, result.getId());
    }

    @Test
    void getLecture_NotFound_ThrowsException() {
        when(userService.getUserBySupabaseId(supabaseUserId)).thenReturn(mockUser);
        when(lectureRepository.findByIdAndUserId(lectureId, userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                lectureService.getLecture(lectureId, supabaseUserId));
    }

    @Test
    void updateLecture_Success() {
        UpdateLectureRequest request = new UpdateLectureRequest();
        request.setTitle("Updated Title");

        when(userService.getUserBySupabaseId(supabaseUserId)).thenReturn(mockUser);
        when(lectureRepository.findByIdAndUserId(lectureId, userId)).thenReturn(Optional.of(mockLecture));
        when(lectureRepository.save(any(LectureSession.class))).thenReturn(mockLecture);

        LectureSession result = lectureService.updateLecture(lectureId, supabaseUserId, request);

        assertNotNull(result);
        assertEquals("Updated Title", mockLecture.getTitle());
        verify(lectureRepository, times(1)).save(mockLecture);
    }

    @Test
    void deleteLecture_Success() {
        when(userService.getUserBySupabaseId(supabaseUserId)).thenReturn(mockUser);
        when(lectureRepository.findByIdAndUserId(lectureId, userId)).thenReturn(Optional.of(mockLecture));

        lectureService.deleteLecture(lectureId, supabaseUserId);

        verify(lectureRepository, times(1)).delete(mockLecture);
    }
}

