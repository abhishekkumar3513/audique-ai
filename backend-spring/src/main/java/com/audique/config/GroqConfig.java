package com.audique.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@Data
public class GroqConfig {

    @Value("${groq.api-key:}")
    private String apiKey;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${groq.whisper-model:whisper-large-v3-turbo}")
    private String whisperModel;

    @Value("${groq.llm-model:openai/gpt-oss-120b}")
    private String llmModel;

    @Value("${groq.timeout:120}")
    private int timeout;

    @Bean
    public WebClient groqWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(32 * 1024 * 1024)) // 32MB
                .build();

        WebClient.Builder builder = WebClient.builder()
                .baseUrl(baseUrl)
                .exchangeStrategies(strategies);

        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey.trim());
        }

        return builder.build();
    }
}
