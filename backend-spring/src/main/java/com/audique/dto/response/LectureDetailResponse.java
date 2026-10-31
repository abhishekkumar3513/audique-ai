package com.audique.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LectureDetailResponse {
    private UUID id;
    private String title;
    private String audioFilePath;
    private Integer duration;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private TranscriptResponse transcript;
    private SummaryResponse summary;
    private List<NoteResponse> notes;
    private List<FlashcardResponse> flashcards;
}

