package com.example.backend.repository;

import com.example.backend.model.User;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Optional<User> findByVerificationCode(String verificationCode);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
