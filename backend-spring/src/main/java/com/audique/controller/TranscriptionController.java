package com.audique.controller;

import com.audique.dto.DtoMapper;
import com.audique.dto.response.TranscriptResponse;
import com.audique.entity.Transcript;
import com.audique.security.SecurityUtils;
import com.audique.service.TranscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/lectures/{id}")
@RequiredArgsConstructor
@Slf4j
public class TranscriptionController {

    private final TranscriptionService transcriptionService;
    private final SecurityUtils securityUtils;

    @PostMapping("/transcribe")
    public ResponseEntity<TranscriptResponse> transcribe(
            @PathVariable UUID id,
            @RequestParam("audio") MultipartFile audioFile
    ) throws IOException {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        log.info("Transcription request for lecture session {} by user {}", id, supabaseUserId);

        Transcript transcript = transcriptionService.transcribeLecture(
                id,
                supabaseUserId,
                audioFile.getBytes(),
                audioFile.getOriginalFilename(),
                audioFile.getContentType()
        );

        return ResponseEntity.ok(DtoMapper.toTranscriptResponse(transcript));
    }

    @GetMapping("/transcript")
    public ResponseEntity<TranscriptResponse> getTranscript(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Transcript transcript = transcriptionService.getLatestTranscript(id, supabaseUserId);
        return ResponseEntity.ok(DtoMapper.toTranscriptResponse(transcript));
    }
}

