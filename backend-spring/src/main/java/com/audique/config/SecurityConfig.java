package com.audique.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Slf4j
public class SecurityConfig {

    @Value("${supabase.jwt-secret:}")
    private String jwtSecret;

    @Value("${supabase.jwks-url:}")
    private String jwksUrl;

    @Value("${supabase.discovery-url:}")
    private String discoveryUrl;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/",
                                "/actuator/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/transcribe",
                                "/summarize",
                                "/flashcards",
                                "/download-pdf"
                        ).permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // 1. If JWKS URL or Discovery URL is provided (modern Supabase Asymmetric signing)
        String effectiveJwksUrl = null;
        if (jwksUrl != null && !jwksUrl.isBlank()) {
            effectiveJwksUrl = jwksUrl.trim();
        } else if (discoveryUrl != null && !discoveryUrl.isBlank()) {
            effectiveJwksUrl = discoveryUrl.trim().endsWith(".json")
                    ? discoveryUrl.trim()
                    : discoveryUrl.trim().replaceAll("/+$", "") + "/.well-known/jwks.json";
        } else if (supabaseUrl != null && !supabaseUrl.isBlank() && !supabaseUrl.contains("localhost")) {
            effectiveJwksUrl = supabaseUrl.trim().replaceAll("/+$", "") + "/auth/v1/.well-known/jwks.json";
        }

        if (effectiveJwksUrl != null) {
            log.info("Configuring Supabase Asymmetric JWKS JWT Decoder with URI: {}", effectiveJwksUrl);
            return NimbusJwtDecoder.withJwkSetUri(effectiveJwksUrl).build();
        }

        // 2. Symmetric secret (HS256)
        if (jwtSecret != null && !jwtSecret.isBlank()) {
            log.info("Configuring Supabase HMAC-SHA256 JWT Decoder with secret key");
            SecretKeySpec secretKey = new SecretKeySpec(
                    jwtSecret.trim().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            return NimbusJwtDecoder.withSecretKey(secretKey)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        // 3. Fallback for offline development
        log.warn("No Supabase JWT Secret or JWKS URL configured. Using default offline development decoder.");
        SecretKeySpec secretKey = new SecretKeySpec(
                "default-insecure-jwt-secret-key-for-development-must-be-at-least-256-bits-long!".getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
}
