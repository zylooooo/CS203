package com.example.backend.exception;

public class AdminAlreadyVerifiedException extends RuntimeException {

    public AdminAlreadyVerifiedException(String message) {
        super(message);
    }
}
