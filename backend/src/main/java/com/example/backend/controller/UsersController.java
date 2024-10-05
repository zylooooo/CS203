package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;


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
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            logger.info("User created successfully: {}", createdUser.getUserName());
            return ResponseEntity.ok(createdUser);
        } catch (IllegalArgumentException e) {
            logger.error("Validation errors during user creation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            logger.error("Error creating user: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Health check endpoint
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            logger.info("Received request to get all users");
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error getting all users", e);
            return ResponseEntity.internalServerError().body("An error occurred while fetching users");
        }
    }
}
