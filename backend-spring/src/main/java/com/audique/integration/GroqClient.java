package com.audique.integration;

import com.audique.config.GroqConfig;
import com.audique.dto.groq.GeneratedFlashcardsResponse;
import com.audique.dto.groq.GeneratedNotesResponse;
import com.audique.dto.groq.GroqChatRequest;
import com.audique.dto.groq.GroqChatResponse;
import com.audique.dto.groq.GroqTranscriptionResponse;
import com.audique.exception.AiGenerationException;
import com.audique.exception.AudioProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqClient {

    private final WebClient groqWebClient;
    private final GroqConfig groqConfig;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String transcribeAudio(byte[] audioData, String fileName, String mimeType) {
        log.info("Sending audio ({} bytes, file: {}, type: {}) to Groq Whisper model {}",
                audioData.length, fileName, mimeType, groqConfig.getWhisperModel());

        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("model", groqConfig.getWhisperModel());
            builder.part("response_format", "json");

            ByteArrayResource resource = new ByteArrayResource(audioData) {
                @Override
                public String getFilename() {
                    return (fileName != null && !fileName.isBlank()) ? fileName : "recording.webm";
                }
            };

            String effectiveMimeType = (mimeType != null && !mimeType.isBlank()) ? mimeType : "audio/webm";
            builder.part("file", resource)
                    .header(HttpHeaders.CONTENT_TYPE, effectiveMimeType);

            MultiValueMap<String, HttpEntity<?>> body = builder.build();

            GroqTranscriptionResponse response = groqWebClient.post()
                    .uri("/audio/transcriptions")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(body))
                    .retrieve()
                    .bodyToMono(GroqTranscriptionResponse.class)
                    .block();

            if (response == null || response.getText() == null || response.getText().isBlank()) {
                throw new AudioProcessingException("Empty transcription received from Groq Whisper");
            }

            log.info("Transcription received successfully: {} characters", response.getText().length());
            return response.getText();

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Groq Whisper API returned status {} with body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AudioProcessingException("Groq Whisper error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString(), e);
        } catch (AudioProcessingException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq Whisper transcription failed: {}", e.getMessage(), e);
            throw new AudioProcessingException("Failed to transcribe audio via Groq: " + e.getMessage(), e);
        }
    }

    public String generateChatCompletion(String systemPrompt, String userPrompt, boolean jsonMode) {
        try {
            List<GroqChatRequest.GroqMessage> messages = List.of(
                    GroqChatRequest.GroqMessage.builder().role("system").content(systemPrompt).build(),
                    GroqChatRequest.GroqMessage.builder().role("user").content(userPrompt).build()
            );

            GroqChatRequest.GroqChatRequestBuilder requestBuilder = GroqChatRequest.builder()
                    .model(groqConfig.getLlmModel())
                    .messages(messages)
                    .temperature(0.5)
                    .maxTokens(2000);

            if (jsonMode) {
                requestBuilder.responseFormat(GroqChatRequest.GroqResponseFormat.builder().type("json_object").build());
            }

            GroqChatRequest request = requestBuilder.build();

            GroqChatResponse response = groqWebClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GroqChatResponse.class)
                    .block();

            if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
                throw new AiGenerationException("No response received from Groq LLM");
            }

            String content = response.getChoices().get(0).getMessage().getContent();
            if (content == null || content.isBlank()) {
                throw new AiGenerationException("Empty content received from Groq LLM");
            }

            return content;

        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Groq Chat completion returned status {} with body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new AiGenerationException("Groq Chat error [" + e.getStatusCode() + "]: " + e.getResponseBodyAsString(), e);
        } catch (AiGenerationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Groq LLM generation failed: {}", e.getMessage(), e);
            throw new AiGenerationException("Failed to generate content with Groq LLM: " + e.getMessage(), e);
        }
    }

    public String generateSummary(String transcript) {
        String systemPrompt = "You are a distinguished university professor and elite academic synthesizer. "
                + "Your task is to transform raw classroom lecture transcripts into publication-grade, insightful executive summaries.";

        String userPrompt = "Analyze the following lecture transcript and write an authoritative, beautifully structured academic summary.\n\n"
                + "STRUCTURE YOUR SUMMARY WITH THESE EXACT THREE SECTIONS:\n\n"
                + "### Executive Overview\n"
                + "Write 2 articulate, comprehensive paragraphs explaining the central thesis, intellectual framework, and core academic significance of what was taught.\n\n"
                + "### Core Concepts\n"
                + "Identify 3 to 4 fundamental concepts explored in the lecture. For each concept, use this exact format:\n"
                + "- **Concept Title**: A clear, in-depth explanation of how this concept works and why it matters.\n\n"
                + "### Key Takeaways\n"
                + "Provide 4 to 6 high-impact takeaway conclusions (each starting with '• ') that capture the essential principles for exam mastery.\n\n"
                + "CRITICAL INSTRUCTIONS:\n"
                + "1. SYNTHESIZE, DO NOT TRANSCRIBE: Do not copy the speaker's exact conversational phrasing, filler, or informal language. Explain everything in articulate, academic prose.\n"
                + "2. ELIMINATE SPOKEN DISFLUENCIES: Filter out conversational pauses, fillers ('um', 'uh', 'you know'), and rhetorical tangents.\n"
                + "3. Write with depth, precision, and clarity.\n\n"
                + "Transcript:\n" + transcript;

        return generateChatCompletion(systemPrompt, userPrompt, false);
    }

    public GeneratedNotesResponse generateNotes(String transcript) {
        String systemPrompt = "You are an AI assistant that extracts structured notes from lecture transcripts. "
                + "You must respond with valid JSON only in the format: {\"notes\": [{\"heading\": \"Topic Title\", \"content\": \"Explanation...\"}]}";

        String userPrompt = "Analyze the following lecture transcript and create comprehensive, organized notes.\n\n"
                + "Requirements:\n"
                + "1. Only use information from the transcript.\n"
                + "2. Create clear headings for each distinct topic or concept.\n"
                + "3. Write concise but thorough content for each note.\n"
                + "4. Capture all key ideas, definitions, and concepts.\n"
                + "5. Respond ONLY with valid JSON matching {\"notes\": [{\"heading\": \"...\", \"content\": \"...\"}]}.\n\n"
                + "Transcript:\n" + transcript;

        String rawJson = generateChatCompletion(systemPrompt, userPrompt, true);

        try {
            return objectMapper.readValue(rawJson, GeneratedNotesResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse LLM JSON for notes: {}. Attempting fallback parsing.", e.getMessage());
            // Fallback: create a single note with raw content
            GeneratedNotesResponse fallback = new GeneratedNotesResponse();
            List<GeneratedNotesResponse.GeneratedNote> list = new ArrayList<>();
            list.add(GeneratedNotesResponse.GeneratedNote.builder()
                    .heading("Lecture Notes")
                    .content(rawJson)
                    .build());
            fallback.setNotes(list);
            return fallback;
        }
    }

    public GeneratedFlashcardsResponse generateFlashcards(String transcript) {
        String systemPrompt = "You are an AI assistant that creates educational flashcards from lecture transcripts. "
                + "You must respond with valid JSON only in the format: {\"flashcards\": [{\"question\": \"Question?\", \"answer\": \"Answer.\"}]}";

        String userPrompt = "Create educational flashcards to test student comprehension from the following lecture transcript.\n\n"
                + "Requirements:\n"
                + "1. Only use information from the transcript.\n"
                + "2. Create clear, conceptual questions for the 'question' field (e.g. 'What is...', 'How does...', 'Why does...').\n"
                + "3. Provide informative, accurate answers for the 'answer' field.\n"
                + "4. Cover core definitions, formulas, key arguments, and facts.\n"
                + "5. NEVER use headings, titles, or section labels like 'Overview', 'Key Observations', 'Key Takeaways', or 'Summary' as cards.\n"
                + "6. Respond ONLY with valid JSON matching {\"flashcards\": [{\"question\": \"...\", \"answer\": \"...\"}]}.\n\n"
                + "Transcript:\n" + transcript;

        String rawJson = generateChatCompletion(systemPrompt, userPrompt, true);

        try {
            return objectMapper.readValue(rawJson, GeneratedFlashcardsResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse LLM JSON for flashcards: {}. Attempting fallback parsing.", e.getMessage());
            GeneratedFlashcardsResponse fallback = new GeneratedFlashcardsResponse();
            fallback.setFlashcards(new ArrayList<>());
            return fallback;
        }
    }
}

