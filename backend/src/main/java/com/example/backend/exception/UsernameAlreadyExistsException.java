package com.example.backend.exception;

public class UsernameAlreadyExistsException extends RuntimeException {

    public UsernameAlreadyExistsException(String msg) {
        super(msg);
    }
    
}
