package com.example.backend.exception;

public class AdminNotEnabledException extends RuntimeException {
    public AdminNotEnabledException(String message) {
        super(message);
    }
}
