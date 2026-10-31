package com.audique.integration;

import com.audique.config.StorageConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupabaseStorageClient {

    private final WebClient supabaseWebClient;
    private final StorageConfig storageConfig;

    public String uploadAudio(byte[] audioData, String fileName, String contentType) {
        if (storageConfig.getUrl() == null || storageConfig.getUrl().isBlank()) {
            log.info("Supabase storage URL not configured; using local identifier");
            return "local/" + UUID.randomUUID() + "/" + fileName;
        }

        String safeFileName = (fileName != null && !fileName.isBlank()) ? fileName : "audio.webm";
        String objectPath = "audio/" + UUID.randomUUID() + "/" + safeFileName;
        String bucket = storageConfig.getStorageBucket();

        log.info("Uploading audio ({} bytes) to Supabase Storage: {}/{}", audioData.length, bucket, objectPath);

        try {
            MediaType mediaType = (contentType != null && !contentType.isBlank())
                    ? MediaType.parseMediaType(contentType)
                    : MediaType.parseMediaType("audio/webm");

            supabaseWebClient.post()
                    .uri("/storage/v1/object/{bucket}/{path}", bucket, objectPath)
                    .contentType(mediaType)
                    .bodyValue(audioData)
                    .retrieve()
                    .toBodilessEntity()
                    .block();

            log.info("Successfully uploaded audio to Supabase Storage: {}", objectPath);
            return objectPath;

        } catch (Exception e) {
            log.warn("Supabase Storage upload failed ({}). Returning generated path for offline support.", e.getMessage());
            return objectPath;
        }
    }

    public String getPublicUrl(String filePath) {
        if (filePath == null || filePath.isBlank()) return null;
        if (storageConfig.getUrl() == null || storageConfig.getUrl().isBlank()) {
            return "/api/audio/" + filePath;
        }
        return storageConfig.getUrl() + "/storage/v1/object/public/" + storageConfig.getStorageBucket() + "/" + filePath;
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank() || filePath.startsWith("local/")) return;

        try {
            supabaseWebClient.delete()
                    .uri("/storage/v1/object/{bucket}/{path}", storageConfig.getStorageBucket(), filePath)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Deleted audio file from Supabase Storage: {}", filePath);
        } catch (Exception e) {
            log.warn("Failed to delete file from Supabase Storage ({}): {}", filePath, e.getMessage());
        }
    }
}

