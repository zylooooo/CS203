package com.example.backend.repository;

import com.example.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findByUserName(String userName);

    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
}
