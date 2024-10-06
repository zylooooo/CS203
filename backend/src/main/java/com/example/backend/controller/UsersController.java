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
     * Asynchronously creates a new user and updates the user details in the database.
     *
     * This method handles the HTTP POST request to the "/signup" endpoint. It validates the user data
     * and checks for any existing users with the same email or username. If validation fails, it returns
     * a bad request response with the validation error messages. If the user is created successfully,
     * it returns a success response with the created user details.
     *
     * @param user the User object containing the details of the user to be created.
     * @return a CompletableFuture containing a ResponseEntity. If the user is created successfully,
     *         it returns a ResponseEntity with HTTP status 200 (OK) and the created user. If there are
     *         validation errors or other issues, it returns a ResponseEntity with HTTP status 400 (Bad Request)
     *         and the corresponding error message.
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

    // Async health check endpoint to get all the users
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
