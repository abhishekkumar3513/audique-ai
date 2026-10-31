package com.audique.repository;

import com.audique.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findBySupabaseUserId(String supabaseUserId);

    Optional<User> findByEmail(String email);

    boolean existsBySupabaseUserId(String supabaseUserId);
}
