package com.audique.controller;

import com.audique.dto.DtoMapper;
import com.audique.dto.response.SummaryResponse;
import com.audique.entity.Summary;
import com.audique.security.SecurityUtils;
import com.audique.service.SummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/lectures/{id}")
@RequiredArgsConstructor
@Slf4j
public class SummaryController {

    private final SummaryService summaryService;
    private final SecurityUtils securityUtils;

    @PostMapping("/summarize")
    public ResponseEntity<SummaryResponse> generateSummary(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        log.info("Generating summary for lecture session {} by user {}", id, supabaseUserId);
        Summary summary = summaryService.generateSummary(id, supabaseUserId);
        return ResponseEntity.ok(DtoMapper.toSummaryResponse(summary));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryResponse> getSummary(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        Summary summary = summaryService.getLatestSummary(id, supabaseUserId);
        return ResponseEntity.ok(DtoMapper.toSummaryResponse(summary));
    }
}

