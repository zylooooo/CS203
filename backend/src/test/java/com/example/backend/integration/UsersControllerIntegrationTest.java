package com.example.backend.integration;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
        baseUrl = "http://localhost:" + port + "/users";
        headers = new HttpHeaders();
        resetDatabase();
    }

    @AfterEach
    void tearDown() {
        resetDatabase();
    }

    private void resetDatabase() {
        userRepository.deleteAll();
    }

    private User createTestUser(String username, String email, String gender) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password"));
        user.setGender(gender);
        user.setElo(1000);
        return userRepository.save(user);
    }

    private void authenticateUser(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = jwtService.generateToken(userPrincipal);
        headers.setBearerAuth(token);
    }

    @Test
    void getAllUsers_WithAuthenticatedUser_ReturnsListOfUsers() {
        // Arrange
        createTestUser("user1", "user1@example.com", "MALE");
        createTestUser("user2", "user2@example.com", "FEMALE");
        authenticateUser("user1");

        // Act
        ResponseEntity<List<User>> response = restTemplate.exchange(
            baseUrl, HttpMethod.GET, new HttpEntity<>(headers), new ParameterizedTypeReference<List<User>>() {});

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<User> body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals(2, body.size());
    }

    @Test
    void getUserProfile_WithAuthenticatedUser_ReturnsUserProfile() {
        // Arrange
        User user = createTestUser("testuser", "testuser@example.com", "MALE");
        authenticateUser("testuser");

        // Act
        ResponseEntity<User> response = restTemplate.exchange(
            baseUrl + "/profile", HttpMethod.GET, new HttpEntity<>(headers), User.class);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        User body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals(user.getUsername(), body.getUsername());
        assertEquals(user.getEmail(), body.getEmail());
    }

    @Test
    void checkCredentialsAvailability_WithAvailableUsername_ReturnsAvailable() {
        // Arrange
        String username = "newuser";

        // Act
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            baseUrl + "/signup/check-credentials-availability?username=" + username, 
            HttpMethod.GET, 
            null, 
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );

        // Assert
        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertTrue((Boolean) body.get("usernameAvailable"));
    }

    @Test
    void updateUser_WithAuthenticatedUser_UpdatesUserDetails() {
        // Arrange
        createTestUser("updateuser", "updateuser@example.com", "MALE");
        authenticateUser("updateuser");
        User updatedDetails = new User();
        updatedDetails.setEmail("newemail@example.com");

        // Act
        ResponseEntity<User> response = restTemplate.exchange(
            baseUrl + "/update", HttpMethod.PUT, new HttpEntity<>(updatedDetails, headers), User.class);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        User body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals("newemail@example.com", body.getEmail());
    }

    @Test
    void updateUserAvailability_WithAuthenticatedUser_UpdatesAvailability() {
        // Arrange
        createTestUser("availuser", "availuser@example.com", "MALE");
        authenticateUser("availuser");

        // Act
        ResponseEntity<User> response = restTemplate.exchange(
            baseUrl + "/update-availability?availability=true", HttpMethod.PUT, new HttpEntity<>(headers), User.class);

        // Assert
        assertEquals(200, response.getStatusCode().value());
        User body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertTrue(body.isAvailable());
    }

    @Test
    void deleteUser_WithAuthenticatedUser_DeletesUser() {
        // Arrange
        createTestUser("deleteuser", "deleteuser@example.com", "MALE");
        authenticateUser("deleteuser");

        // Act
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            baseUrl + "/delete", HttpMethod.DELETE, new HttpEntity<>(headers), new ParameterizedTypeReference<Map<String, Object>>() {});

        // Assert
        assertEquals(204, response.getStatusCode().value());
        // No need to check body for 204 No Content response
        assertFalse(userRepository.findByUsername("deleteuser").isPresent());
    }

    @Test
    void getDefaultLeaderBoard_WithAuthenticatedUser_ReturnsLeaderboard() {
        // Arrange
        createTestUser("user1", "user1@example.com", "MALE");
        createTestUser("user2", "user2@example.com", "MALE");
        authenticateUser("user1");

        // Act
        ResponseEntity<List<User>> response = restTemplate.exchange(
            baseUrl + "/leaderboard", HttpMethod.GET, new HttpEntity<>(headers), new ParameterizedTypeReference<List<User>>() {});

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<User> body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals(2, body.size());
    }

    @Test
    void getOppositeGenderLeaderboard_WithAuthenticatedUser_ReturnsOppositeGenderLeaderboard() {
        // Arrange
        createTestUser("user1", "user1@example.com", "MALE");
        createTestUser("user2", "user2@example.com", "FEMALE");
        authenticateUser("user1");

        // Act
        ResponseEntity<List<User>> response = restTemplate.exchange(
            baseUrl + "/leaderboard/opposite-gender", HttpMethod.GET, new HttpEntity<>(headers), new ParameterizedTypeReference<List<User>>() {});

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<User> body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals(1, body.size());
    }

    @Test
    void getMixedGenderLeaderboard_WithAuthenticatedUser_ReturnsMixedGenderLeaderboard() {
        // Arrange
        createTestUser("user1", "user1@example.com", "MALE");
        createTestUser("user2", "user2@example.com", "FEMALE");
        authenticateUser("user1");

        // Act
        ResponseEntity<List<User>> response = restTemplate.exchange(
            baseUrl + "/leaderboard/mixed-gender", HttpMethod.GET, new HttpEntity<>(headers), new ParameterizedTypeReference<List<User>>() {});

        // Assert
        assertEquals(200, response.getStatusCode().value());
        List<User> body = response.getBody();
        assertNotNull(body, "Response body should not be null");
        assertEquals(2, body.size());
    }
}
