package com.example.backend.exception;

public class VerificationCodeExpiredException extends RuntimeException {
    public VerificationCodeExpiredException(String message) {
        super(message);
    }
}
