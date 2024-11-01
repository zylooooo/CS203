package com.example.backend.exception;

public class AdminNotFoundException extends RuntimeException {

    public AdminNotFoundException(String adminName) {
        super("Admin not found with name: " + adminName);
    }

    public AdminNotFoundException() {
        super("No admins found!");
    }
}
