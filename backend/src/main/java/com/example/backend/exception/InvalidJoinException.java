package com.example.backend.exception;

public class InvalidJoinException extends RuntimeException {
    public InvalidJoinException(String message) {
        super(message);
    }
}
