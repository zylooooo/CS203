package com.example.backend.repository;

import com.example.backend.model.Admin;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminRepository extends MongoRepository<Admin, String> {
    Admin findByEmail(String email);
    Admin findByUserName(String userName);
    boolean existsByEmail(String email);
    boolean existsByUserName(String userName);
}
