package com.example.backend.repository;

import com.example.backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByAdminName(String adminName);
    boolean existsByEmail(String email);
    boolean existsByAdminName(String adminName);
}
