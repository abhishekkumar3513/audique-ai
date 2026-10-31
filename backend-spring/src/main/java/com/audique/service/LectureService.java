package com.audique.service;

import com.audique.dto.request.CreateLectureRequest;
import com.audique.dto.request.UpdateLectureRequest;
import com.audique.entity.LectureSession;
import com.audique.entity.User;
import com.audique.exception.ResourceNotFoundException;
import com.audique.exception.UnauthorizedException;
import com.audique.integration.SupabaseStorageClient;
import com.audique.repository.LectureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class LectureService {

    private final LectureRepository lectureRepository;
    private final UserService userService;
    private final SupabaseStorageClient storageClient;

    public LectureSession createLecture(String supabaseUserId, String email, String name, CreateLectureRequest request) {
        User user = userService.getOrCreateUser(supabaseUserId, email, name);

        LectureSession lecture = LectureSession.builder()
                .user(user)
                .title(request.getTitle())
                .status("CREATED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        LectureSession saved = lectureRepository.save(lecture);
        log.info("Created lecture session {} for user {}", saved.getId(), supabaseUserId);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<LectureSession> getUserLectures(String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        return lectureRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional(readOnly = true)
    public Page<LectureSession> getUserLecturesPaginated(String supabaseUserId, Pageable pageable) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        return lectureRepository.findByUserId(user.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public LectureSession getLecture(UUID lectureId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        return lectureRepository.findByIdAndUserId(lectureId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("LectureSession", "id", lectureId));
    }

    public LectureSession updateLecture(UUID lectureId, String supabaseUserId, UpdateLectureRequest request) {
        LectureSession lecture = getLecture(lectureId, supabaseUserId);
        lecture.setTitle(request.getTitle());
        lecture.setUpdatedAt(Instant.now());
        return lectureRepository.save(lecture);
    }

    public void deleteLecture(UUID lectureId, String supabaseUserId) {
        LectureSession lecture = getLecture(lectureId, supabaseUserId);

        if (lecture.getAudioFilePath() != null) {
            try {
                storageClient.deleteFile(lecture.getAudioFilePath());
            } catch (Exception e) {
                log.warn("Could not delete audio file for lecture {}: {}", lectureId, e.getMessage());
            }
        }

        lectureRepository.delete(lecture);
        log.info("Deleted lecture session {} and associated materials", lectureId);
    }

    public void updateLectureStatus(LectureSession lecture, String status) {
        lecture.setStatus(status);
        lecture.setUpdatedAt(Instant.now());
        lectureRepository.save(lecture);
    }
}

