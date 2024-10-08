package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.service.UserService;
import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@RestController // This annotation marks the class as a RESTful web service controller
@RequestMapping("/users") // This annotation maps the class to the users endpoint
@RequiredArgsConstructor // This annotation generates a constructor for the class with final fields
public class UsersController {

    private final UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(UsersController.class);

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
                        .body(Map.of("error", "An unexpected error occurred while fetching users!"));
            });
    }

    /**
     * Asynchronously checks the availability of a username and/or email.
     * 
     * This method checks if username and/or email are available for sign up purposes.
     * 
     * @param userName the username to check for availability (optional)
     * @param email the email to check for availability (optional)
     * @return a CompletableFuture containing a response entity with the availability status and message.
     */
    @GetMapping("/signup/check-availability")
    public CompletableFuture<ResponseEntity<?>> checkAvailability(@RequestParam(required = false) String userName, @RequestParam(required = false) String email) {
        Map<String, Object> response = new HashMap<>();

        if (userName == null && email == null) {
            response.put("message", "Either username or email must be provided!");
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().body(response));
        }

        // Create futures for checking username and email availability
        CompletableFuture<Boolean> userNameFuture = userName != null ? userService.checkIfUserNameExists(userName) : CompletableFuture.completedFuture(null);
        CompletableFuture<Boolean> emailFuture = email != null ? userService.checkIfEmailExists(email) : CompletableFuture.completedFuture(null);

        return CompletableFuture.allOf(userNameFuture, emailFuture)
            .<ResponseEntity<?>>thenApply(v -> {
                Boolean userNameExists = userNameFuture.join();
                Boolean emailExists = emailFuture.join();

                StringBuilder message = new StringBuilder();
                boolean hasError = false;

                // Check if username is provided and if it exists
                if (userName == null) {
                    message.append("Username must be provided. ");
                    hasError = true;
                } else {
                    response.put("userNameAvailable", !userNameExists);
                    if (userNameExists) {
                        message.append("Username is already taken. ");
                    }
                }

                // Check if email is provided and if it exists
                if (email == null) {
                    message.append("Email must be provided. ");
                    hasError = true;
                } else {
                    response.put("emailAvailable", !emailExists);
                    if (emailExists) {
                        message.append("Email is already in use. ");
                    }
                }

                // If no errors and both username and email are provided, set both as available
                if (!hasError && message.length() == 0) {
                    if (userName != null && email != null) {
                        message.append("Username and email are available.");
                    } else if (userName != null) {
                        message.append("Username is available.");
                    } else {
                        message.append("Email is available.");
                    }
                }

                response.put("message", message.toString().trim());

                if (hasError) {
                    return ResponseEntity.badRequest().body(response);
                } else {
                    return ResponseEntity.ok(response);
                }
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                response.put("message", cause.getMessage());
                return ResponseEntity.badRequest().body(response);
            });
    }

    /**
     * Asynchronously creates a new user and updates the user details in the
     * database.
     *
     * This method handles the HTTP POST request to the "/signup" endpoint. 
     * It validates the user data and checks for any existing users with the same email or username. 
     * If validation fails, it returns a bad request response with the validation error messages. 
     * If the user is created successfully, it returns a success response with the created user details.
     *
     * @param user the User object containing the details of the user to be created.
     * @return a CompletableFuture containing a ResponseEntity. If the user is
     *         created successfully,
     *         it returns a ResponseEntity with HTTP status 200 (OK) and the created
     *         user. If there are
     *         validation errors or other issues, it returns a ResponseEntity with
     *         HTTP status 400 (Bad Request)
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
                        return ResponseEntity.badRequest().body(Map.of("error", cause.getMessage()));
                    } else {
                        logger.error("Error creating user: {}", cause.getMessage(), cause);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", "An unexpected error occurred while creating the user!"));
                    }
                });
    }

    /**
     * Retrieves the user profile based on the user name
     * @param userName the username of the user to retrieve, must not be null or empty
     * @return the user object associated with the specified username
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the retrieval process
     */
    @GetMapping("/{userName}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userName) {
        try {
            User user = userService.getUserByUsername(userName);
            logger.info("User profile retrieved successfully: {}", userName);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", userName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error retrieving user profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred while retrieving the user profile!"));
        }
    }

    /**
     * Updates the user details based on the user name
     * @param userName the username of the user to update, must not be null or empty
     * @param newUserDetails the new details of the user to be updated
     * @return the updated user object
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the update process
     */
    @PutMapping("/{userName}/update")
    public CompletableFuture<ResponseEntity<?>> updateUser(@PathVariable String userName, @RequestBody User newUserDetails) {
        return userService.updateUser(userName, newUserDetails)
            .<ResponseEntity<?>>thenApply(updatedUser -> {
                logger.info("User updated successfully: {}", userName);
                return ResponseEntity.ok(updatedUser);
            })
            .exceptionally(e -> {
                Throwable cause = e.getCause();
                if (cause instanceof IllegalArgumentException) {
                    logger.error("Validation errors during user update: {}", cause.getMessage());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", cause.getMessage()));
                } else if (cause instanceof UserNotFoundException) {
                    logger.error("User not found: {}", userName);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", cause.getMessage()));
                } else {
                    logger.error("Unexpected error updating user: {}", cause.getMessage(), cause);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(cause.getMessage());
                }
            });
    }

    /**
     * Updates the availability of a user based on the user name
     * @param userName the username of the user to update, must not be null or empty
     * @param availability the new availability status of the user
     * @return the updated user object
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the update process
     */
    @PutMapping("/{userName}/update-availability")
    public ResponseEntity<?> updateUserAvailability(@PathVariable String userName, @RequestParam Boolean availability) {
        try {
            User user = userService.updateUserAvailability(userName, availability);
            logger.info("User availability updated successfully: {}", userName);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", userName);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating user availability: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred while updating the user availability!"));
        }
    }
}
