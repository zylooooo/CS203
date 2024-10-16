package com.example.backend.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.util.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JwtService;
import com.example.backend.security.UserPrincipal;
import com.example.backend.exception.UserNotFoundException;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class UsersControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private String baseUrl;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/users";
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create a test user
        User testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setEmail("testuser@example.com");
        testUser.setEnabled(true);
        testUser.setRole("ROLE_USER"); // Make sure to set a role
        userRepository.save(testUser);

        // Generate JWT token
        UserPrincipal userPrincipal = UserPrincipal.create(testUser);
        String jwtToken = jwtService.generateToken(userPrincipal);

        // Add token to headers
        headers.setBearerAuth(jwtToken);

        System.out.println("JWT Token: " + jwtToken); // For debugging
    }

    @Test
    void testGetAllUsers() {
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl,
            HttpMethod.GET,
            new HttpEntity<>(headers),
            String.class
        );

        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @AfterEach
    void tearDown() {
        userRepository.deleteAll();
    }

}
