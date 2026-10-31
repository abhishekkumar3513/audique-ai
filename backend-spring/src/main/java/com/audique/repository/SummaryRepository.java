package com.audique.repository;

import com.audique.entity.Summary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SummaryRepository extends JpaRepository<Summary, UUID> {

    Optional<Summary> findTopByLectureSessionIdOrderByVersionDesc(UUID lectureSessionId);

    List<Summary> findByLectureSessionIdOrderByVersionDesc(UUID lectureSessionId);

    int countByLectureSessionId(UUID lectureSessionId);
}
