package com.audique.service;

import com.audique.entity.User;
import com.audique.exception.ResourceNotFoundException;
import com.audique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public User getOrCreateUser(String supabaseUserId, String email, String name) {
        return userRepository.findBySupabaseUserId(supabaseUserId)
                .map(existingUser -> {
                    boolean updated = false;
                    if (email != null && !email.isBlank() && !email.equals(existingUser.getEmail())) {
                        existingUser.setEmail(email);
                        updated = true;
                    }
                    if (name != null && !name.isBlank() && !name.equals(existingUser.getName())) {
                        existingUser.setName(name);
                        updated = true;
                    }
                    return updated ? userRepository.save(existingUser) : existingUser;
                })
                .orElseGet(() -> {
                    log.info("Creating new application user mapped from Supabase user ID: {}", supabaseUserId);
                    User newUser = User.builder()
                            .supabaseUserId(supabaseUserId)
                            .email(email != null && !email.isBlank() ? email : supabaseUserId + "@audique.local")
                            .name(name != null && !name.isBlank() ? name : "Student")
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    return userRepository.save(newUser);
                });
    }

    @Transactional(readOnly = true)
    public User getUserBySupabaseId(String supabaseUserId) {
        return userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "supabaseUserId", supabaseUserId));
    }
}

