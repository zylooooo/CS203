package com.example.backend.exception;

public class UserAlreadyVerifiedException extends RuntimeException {
    public UserAlreadyVerifiedException(String message) {
        super(message);
    }
}