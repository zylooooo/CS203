package com.example.backend.responses;

import lombok.Getter;
import lombok.Setter;

/**
 * LoginResponse class is used to return the login response to the client.
 * It contains the token and the expiration time of the token.
 */
@Getter
@Setter
public class LoginResponse {

    private String token;

    private long expiresIn;

    public LoginResponse(String token, long expiresIn) {
        this.token = token;
        this.expiresIn = expiresIn;
    }
    
}