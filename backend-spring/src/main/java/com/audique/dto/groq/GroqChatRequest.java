package com.audique.dto.groq;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GroqChatRequest {
    private String model;
    private List<GroqMessage> messages;
    private double temperature;
    @JsonProperty("max_tokens")
    private Integer maxTokens;
    @JsonProperty("response_format")
    private GroqResponseFormat responseFormat;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroqMessage {
        private String role;
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroqResponseFormat {
        private String type;
    }
}

