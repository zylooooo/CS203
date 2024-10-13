package com.example.backend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;


/**
 * ErrorResponse class that is used to return error messages to the client.
 * This is useful for returning error messages in a consistent format.
 */

@Data
@AllArgsConstructor
public class ErrorResponse {
    private String errorCode;
    private String errorMessage;
}