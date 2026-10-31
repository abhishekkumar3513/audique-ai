package com.audique.controller;

import com.audique.security.SecurityUtils;
import com.audique.service.PdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/lectures/{id}/export")
@RequiredArgsConstructor
@Slf4j
public class PdfController {

    private final PdfService pdfService;
    private final SecurityUtils securityUtils;

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable UUID id) {
        String supabaseUserId = securityUtils.getSupabaseUserId();
        log.info("Generating PDF export for lecture {} by user {}", id, supabaseUserId);

        byte[] pdfBytes = pdfService.generateLecturePdf(id, supabaseUserId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Lecture_Notes.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

