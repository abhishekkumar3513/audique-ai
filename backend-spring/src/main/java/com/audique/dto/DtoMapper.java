package com.audique.dto;

import com.audique.dto.response.FlashcardResponse;
import com.audique.dto.response.LectureDetailResponse;
import com.audique.dto.response.LectureResponse;
import com.audique.dto.response.NoteResponse;
import com.audique.dto.response.SummaryResponse;
import com.audique.dto.response.TranscriptResponse;
import com.audique.entity.Flashcard;
import com.audique.entity.LectureSession;
import com.audique.entity.Note;
import com.audique.entity.Summary;
import com.audique.entity.Transcript;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class DtoMapper {

    public static LectureResponse toLectureResponse(LectureSession entity) {
        if (entity == null) return null;
        return LectureResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .audioFilePath(entity.getAudioFilePath())
                .duration(entity.getDuration())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static TranscriptResponse toTranscriptResponse(Transcript entity) {
        if (entity == null) return null;
        return TranscriptResponse.builder()
                .id(entity.getId())
                .fullText(entity.getFullText())
                .language(entity.getLanguage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static SummaryResponse toSummaryResponse(Summary entity) {
        if (entity == null) return null;
        return SummaryResponse.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .version(entity.getVersion())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public static NoteResponse toNoteResponse(Note entity) {
        if (entity == null) return null;
        return NoteResponse.builder()
                .id(entity.getId())
                .heading(entity.getHeading())
                .content(entity.getContent())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static FlashcardResponse toFlashcardResponse(Flashcard entity) {
        if (entity == null) return null;
        return FlashcardResponse.builder()
                .id(entity.getId())
                .question(entity.getQuestion())
                .answer(entity.getAnswer())
                .displayOrder(entity.getDisplayOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static LectureDetailResponse toLectureDetailResponse(
            LectureSession entity,
            Transcript transcript,
            Summary summary,
            List<Note> notes,
            List<Flashcard> flashcards
    ) {
        if (entity == null) return null;
        return LectureDetailResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .audioFilePath(entity.getAudioFilePath())
                .duration(entity.getDuration())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .transcript(toTranscriptResponse(transcript))
                .summary(toSummaryResponse(summary))
                .notes(notes != null ? notes.stream().map(DtoMapper::toNoteResponse).toList() : Collections.emptyList())
                .flashcards(flashcards != null ? flashcards.stream().map(DtoMapper::toFlashcardResponse).toList() : Collections.emptyList())
                .build();
    }
}

