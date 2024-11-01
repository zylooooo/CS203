package com.example.backend.exception;

public class UserBannedException extends RuntimeException {
    public UserBannedException(String message) {
        super(message);
    }
}
