package com.example.backend.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String username) {
        super("User not found with username: " + username);
    }

    public UserNotFoundException() {
        super("No users found!");
    }
}
