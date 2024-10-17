package com.example.backend.controller;

import com.example.backend.service.AdminService;
import com.example.backend.service.UserService;
import com.example.backend.responses.ErrorResponse;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.model.User;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController // This annotation marks the class as a RESTful web service controller
@RequestMapping("/users") // This annotation maps the class to the users endpoint
@RequiredArgsConstructor // This annotation generates a constructor for the class with final fields
public class UsersController {

    private final UserService userService;
    private final AdminService adminService;
    private static final Logger logger = LoggerFactory.getLogger(UsersController.class);

    // health check endpoint to get all the users
    @GetMapping
    ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (RuntimeException e) {
            logger.error("Unexpected error while fetching all users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("An unexpected error occurred while fetching all users!"));
        }
    }

    /**
     * Retrieves the user profile based on the user name
     * @param username the username of the user to retrieve, must not be null or empty
     * @return the user object associated with the specified username
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the retrieval process
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        try {
            User user = userService.getUserByUsername(username);
            logger.info("User profile retrieved successfully: {}", username);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Error retrieving user profile: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while retrieving the user profile!"));
        }
    }

    @GetMapping("/signup/check-credentials-availability")
    public ResponseEntity<?> checkCredentialsAvailability(@RequestParam(required = false) String username, @RequestParam(required = false) String email) {
        Map<String, Object> response = new HashMap<>();

        if (username == null && email == null) {
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Either username or email must be provided!"));
        }

        StringBuilder message = new StringBuilder();
        boolean hasError = false;

        // Check if username is provided and if it exists
        if (username != null) {
            boolean usernameExists = (userService.checkIfUsernameExists(username) || adminService.checkIfAdminNameExists(username));
            response.put("usernameAvailable", !usernameExists);
            if (usernameExists) {
                message.append("Username is already taken.");
            }
        }

        // Check if email is provided and if it exists
        if (email != null) {
            boolean emailExists = (userService.checkIfEmailExists(email) || adminService.checkIfEmailExists(email));
            response.put("emailAvailable", !emailExists);
            if (emailExists) {
                message.append("Email is already in use.");
            }
        }

        // If no errors and both username and email are provided, set both as available
        if (!hasError && message.length() == 0) {
            if (username != null && email != null) {
                message.append("Username and email are available.");
            } else if (username != null) {
                message.append("Username is available.");
            } else {
                message.append("Email is available.");
            }
        }

        response.put("message", message.toString().trim());

        return ResponseEntity.ok(response);
    }

    /**
     * Updates the user details based on the user name
     * @param username the username of the user to update, must not be null or empty
     * @param newUserDetails the new details of the user to be updated
     * @return the updated user object
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the update process
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestBody User newUserDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            Map<String, Object> response = userService.updateUser(username, newUserDetails);

            if (response.containsKey("errors")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response.get("errors"));
            }

            return ResponseEntity.ok(response.get("user"));
        } catch (Exception e) {
            logger.error("Unexpected error during user update: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred during user update!"));
        }
    }

    /**
     * Updates the availability of a user based on the user name
     * @param username the username of the user to update, must not be null or empty
     * @param availability the new availability status of the user
     * @return the updated user object
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the update process
     */
    @PutMapping("/update-availability")
    public ResponseEntity<?> updateUserAvailability(@RequestParam Boolean availability) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            User user = userService.updateUserAvailability(username, availability);
            logger.info("User availability updated successfully: {}", username);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error updating user availability: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while updating the user availability!"));
        }
    }

    /**
     * Deletes a user based on the user name
     * @param username the username of the user to delete, must not be null or empty
     * @return a ResponseEntity with a success message if the user is deleted successfully
     * @throws UserNotFoundException if no user with the username is found in the database
     * @throws RuntimeException if there is an unexpected error during the deletion process
     */
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            userService.deleteUser(username);
            logger.info("User deleted successfully: {}", username);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(Map.of("message", "User deleted successfully!"));
        } catch (UserNotFoundException e) {
            logger.error("User not found: {}", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error during user deletion: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("An unexpected error occurred while deleting the user!"));
        }
    }

    // Synchronous method to get the default leaderboard for the user
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getDefaultLeaderBoard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            List<User> leaderboard = userService.getDefaultLeaderboard(username);
            logger.info("Default leaderboard retrieved successfully for user: {}", username);
            return ResponseEntity.ok(leaderboard);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while retrieving the default leaderboard!"));
        }
    }

    // Synchronous method to get the opposite gender leaderboard for the user
    @GetMapping("/leaderboard/opposite-gender")
    public ResponseEntity<?> getOppositeGenderLeaderboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            List<User> oppositeGenderLeaderboard = userService.getOppositeGenderLeaderboard(username);
            logger.info("Opposite gender leaderboard retrieved successfully for user: {}", username);
            return ResponseEntity.ok(oppositeGenderLeaderboard);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while retrieving the opposite gender leaderboard!"));
        }
    }
    
    // Synchronous method to get the mixed gender leaderboard for the user
    @GetMapping("/leaderboard/mixed-gender")
    public ResponseEntity<?> getMixedGenderLeaderboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            List<User> mixedGenderLeaderboard = userService.getMixedGenderLeaderboard(username);
            logger.info("Mixed gender leaderboard retrieved successfully for user: {}", username);
            return ResponseEntity.ok(mixedGenderLeaderboard);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid username: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (UserNotFoundException e) {
            logger.error("Unable to find user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred while retrieving the mixed gender leaderboard!"));
        }
    }
}