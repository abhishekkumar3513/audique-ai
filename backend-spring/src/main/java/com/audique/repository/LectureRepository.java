package com.audique.repository;

import com.audique.entity.LectureSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LectureRepository extends JpaRepository<LectureSession, UUID> {

    List<LectureSession> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<LectureSession> findByUserId(UUID userId, Pageable pageable);

    Optional<LectureSession> findByIdAndUserId(UUID id, UUID userId);

    long countByUserId(UUID userId);
}
