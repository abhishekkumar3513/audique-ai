package com.audique.repository;

import com.audique.entity.Transcript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, UUID> {

    Optional<Transcript> findTopByLectureSessionIdOrderByCreatedAtDesc(UUID lectureSessionId);

    List<Transcript> findByLectureSessionId(UUID lectureSessionId);
}
