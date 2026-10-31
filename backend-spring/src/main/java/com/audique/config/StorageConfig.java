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
public class StorageConfig {

    @Value("${supabase.url:}")
    private String url;

    @Value("${supabase.anon-key:}")
    private String anonKey;

    @Value("${supabase.jwt-secret:}")
    private String jwtSecret;

    @Value("${supabase.jwt-issuer:}")
    private String jwtIssuer;

    @Value("${supabase.storage-bucket:audio-files}")
    private String storageBucket;

    @Value("${supabase.service-role-key:}")
    private String serviceRoleKey;

    @Bean
    public WebClient supabaseWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(codecs -> codecs.defaultCodecs().maxInMemorySize(64 * 1024 * 1024)) // 64MB
                .build();

        String effectiveUrl = (url != null && !url.isBlank()) ? url : "http://localhost:54321";

        WebClient.Builder builder = WebClient.builder()
                .baseUrl(effectiveUrl)
                .exchangeStrategies(strategies);

        String keyToUse = (serviceRoleKey != null && !serviceRoleKey.isBlank()) ? serviceRoleKey : anonKey;
        if (keyToUse != null && !keyToUse.isBlank()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + keyToUse.trim());
            builder.defaultHeader("apikey", keyToUse.trim());
        }

        return builder.build();
    }
}
