package com.audique.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lecture_sessions")
public class LectureSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ToString.Exclude
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "audio_file_path", length = 1000)
    private String audioFilePath;

    @Column
    private Integer duration;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "CREATED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transcript> transcripts = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Summary> summaries = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Note> notes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "lectureSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Flashcard> flashcards = new ArrayList<>();
}
