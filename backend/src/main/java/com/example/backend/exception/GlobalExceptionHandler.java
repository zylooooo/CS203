package com.example.backend.exception;

import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraintViolationException(ConstraintViolationException e) {
        Map<String, String> errorResponse = new HashMap<>();
        e.getConstraintViolations().forEach(constraintViolation -> {
            String input = constraintViolation.getPropertyPath().toString();
            String errorMessage = constraintViolation.getMessage();
            errorResponse.put(input, errorMessage);
        });
        return ResponseEntity.badRequest().body(errorResponse);
    }

    // You can add more exception handlers here as needed
}
