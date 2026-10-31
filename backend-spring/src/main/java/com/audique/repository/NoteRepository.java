package com.audique.repository;

import com.audique.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findByLectureSessionIdOrderByDisplayOrderAsc(UUID lectureSessionId);

    void deleteByLectureSessionId(UUID lectureSessionId);
}
