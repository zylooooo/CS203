package com.example.backend.integration;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.JwtService;
import com.example.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
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
    private DataSource dataSource;

    private String baseUrl;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() throws SQLException {
        baseUrl = "http://localhost:" + port + "/users";
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        String dbUrl = jdbcTemplate.getDataSource().getConnection().getMetaData().getURL();
        System.out.println("Current database URL: " + dbUrl);
        assertTrue(dbUrl.contains("jdbc:h2:mem:") || dbUrl.contains("testdb"), "Test is not using the in-memory database");
    }

    private User createTestUser() {
        // Create a test user with a unique username
        User testUser = new User();
        testUser.setUsername("testuser_" + System.currentTimeMillis());
        testUser.setPassword("password");
        testUser.setEmail("testuser@example.com");
        testUser.setEnabled(true);
        testUser.setRole("ROLE_USER");
        userRepository.save(testUser);

        // Generate JWT token
        UserPrincipal userPrincipal = UserPrincipal.create(testUser);
        String jwtToken = jwtService.generateToken(userPrincipal);

        // Add token to headers
        headers.setBearerAuth(jwtToken);

        System.out.println("Test user created: " + testUser.getUsername());
        return testUser;
    }

    @Test
    void testGetAllUsers() {
        User testUser = createTestUser();
        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl,
            HttpMethod.GET,
            entity,
            String.class
        );

        System.out.println("Response status: " + response.getStatusCode());
        
        String responseBody = response.getBody();
        System.out.println("Response body: " + responseBody);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(responseBody, "Response body should not be null");
        assertTrue(responseBody.contains(testUser.getUsername()), "Response should contain the test user");
    }

    @Test
    void testGetUserProfile() {
        User testUser = createTestUser();
        HttpEntity<String> entity = new HttpEntity<>(null, headers);

        ResponseEntity<User> response = restTemplate.exchange(
            baseUrl + "/profile",
            HttpMethod.GET,
            entity,
            User.class
        );

        System.out.println("Response status: " + response.getStatusCode());
        User responseBody = response.getBody();
        System.out.println("Response body: " + responseBody);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(responseBody, "Response body should not be null");
        assertEquals(testUser.getUsername(), responseBody.getUsername(), "Response should contain the test user's username");
        assertEquals(testUser.getEmail(), responseBody.getEmail(), "Response should contain the test user's email");
        assertNotNull(responseBody.getPassword());
        assertEquals(testUser.isEnabled(), responseBody.isEnabled(), "Enabled status should match");
        assertEquals(testUser.getRole(), responseBody.getRole(), "Role should match");
    }

    @Test
    void testGetUserProfile_UserNotFound() {
        // Create a test user
        User testUser = createTestUser();
        
        // Store the JWT token
        String jwtToken = headers.getFirst(HttpHeaders.AUTHORIZATION);
        
        // Delete the user from the repository
        userRepository.delete(testUser);

        // Create new headers with the stored JWT token
        HttpHeaders testHeaders = new HttpHeaders();
        testHeaders.setContentType(MediaType.APPLICATION_JSON);
        testHeaders.set(HttpHeaders.AUTHORIZATION, jwtToken);

        HttpEntity<String> entity = new HttpEntity<>(null, testHeaders);

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/profile",
            HttpMethod.GET,
            entity,
            String.class
        );

        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody());

        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatusCode().value(), 
            "Expected 404 Not Found, but got " + response.getStatusCode().value());
        assertTrue(response.getBody().contains("User not found"), 
            "Response should contain 'User not found'");
    }

    // Add more test methods for other endpoints
}
