package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.concurrent.CompletableFuture;

@RestController // This annotation marks the class as a RESTful web service controller
@RequestMapping("/users") // This annotation maps the class to the users endpoint
@RequiredArgsConstructor // This annotation generates a constructor for the class with final fields
public class UsersController {
    
    private final UserService userService;
    
    private static final Logger logger = LoggerFactory.getLogger(UsersController.class);

    /**
     * Router to create a new user and updates the user details in the database
     * @param user
     * @return newly created user 
     */
    @PostMapping("/signup")
    public CompletableFuture<ResponseEntity<?>> createUser(@RequestBody User user) {
        return userService.createUser(user)
            .<ResponseEntity<?>>thenApply(createdUser -> {
                logger.info("User created successfully: {}", createdUser.getUserName());
                return ResponseEntity.ok(createdUser);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof IllegalArgumentException) {
                    logger.error("Validation errors during user creation: {}", cause.getMessage());
                    return ResponseEntity.badRequest().body(cause.getMessage());
                } else {
                    logger.error("Error creating user: {}", cause.getMessage(), cause);
                    return ResponseEntity.badRequest().body("An error occurred while creating the user." + cause.getMessage());
                }
            });
    }

    // Health check endpoint
    @GetMapping
    public CompletableFuture<ResponseEntity<?>> getAllUsers() {
        return userService.getAllUsers()
            .<ResponseEntity<?>>thenApply(users -> {
                logger.info("Successfully fetched {} users!", users.size());
                return ResponseEntity.ok(users);
            })
            .exceptionally(e -> {
                logger.error("Error getting all users", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while fetching users!");
            });
    }
}
