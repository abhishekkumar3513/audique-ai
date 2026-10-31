package com.audique.service;

import com.audique.entity.LectureSession;
import com.audique.entity.Transcript;
import com.audique.exception.AudioProcessingException;
import com.audique.exception.ResourceNotFoundException;
import com.audique.integration.GroqClient;
import com.audique.integration.SupabaseStorageClient;
import com.audique.repository.LectureRepository;
import com.audique.repository.TranscriptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TranscriptionService {

    private final LectureService lectureService;
    private final LectureRepository lectureRepository;
    private final TranscriptRepository transcriptRepository;
    private final GroqClient groqClient;
    private final SupabaseStorageClient storageClient;

    public Transcript transcribeLecture(UUID lectureId, String supabaseUserId, byte[] audioData, String fileName, String mimeType) {
        if (audioData == null || audioData.length == 0) {
            throw new AudioProcessingException("Audio file is empty");
        }

        LectureSession lecture = lectureService.getLecture(lectureId, supabaseUserId);
        lectureService.updateLectureStatus(lecture, "TRANSCRIBING");

        try {
            // Upload to Supabase Storage
            String storagePath = storageClient.uploadAudio(audioData, fileName, mimeType);
            lecture.setAudioFilePath(storagePath);
            lectureRepository.save(lecture);

            // Transcribe using Groq Whisper
            String transcriptText = groqClient.transcribeAudio(audioData, fileName, mimeType);

            // Persist transcript
            Transcript transcript = Transcript.builder()
                    .lectureSession(lecture)
                    .fullText(transcriptText)
                    .language("en")
                    .createdAt(Instant.now())
                    .build();

            Transcript saved = transcriptRepository.save(transcript);

            lectureService.updateLectureStatus(lecture, "TRANSCRIBED");
            log.info("Persisted transcript {} for lecture {}", saved.getId(), lectureId);
            return saved;

        } catch (Exception e) {
            lectureService.updateLectureStatus(lecture, "FAILED");
            log.error("Transcription failed for lecture {}: {}", lectureId, e.getMessage(), e);
            throw new AudioProcessingException("Failed to transcribe lecture: " + e.getMessage(), e);
        }
    }

    public Transcript transcribeAnonymous(byte[] audioData, String fileName, String mimeType) {
        if (audioData == null || audioData.length == 0) {
            throw new AudioProcessingException("Audio file is empty");
        }

        String transcriptText = groqClient.transcribeAudio(audioData, fileName, mimeType);

        return Transcript.builder()
                .fullText(transcriptText)
                .language("en")
                .createdAt(Instant.now())
                .build();
    }

    @Transactional(readOnly = true)
    public Transcript getLatestTranscript(UUID lectureId, String supabaseUserId) {
        lectureService.getLecture(lectureId, supabaseUserId); // ownership check
        return transcriptRepository.findTopByLectureSessionIdOrderByCreatedAtDesc(lectureId)
                .orElseThrow(() -> new ResourceNotFoundException("Transcript", "lectureSessionId", lectureId));
    }
}

