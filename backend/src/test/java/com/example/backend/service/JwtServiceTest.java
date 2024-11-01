package com.example.backend.service;

import com.example.backend.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    @Mock
    private UserPrincipal userPrincipal;

    private final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long JWT_EXPIRATION = 86400000; // 1 day

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", JWT_EXPIRATION);
    }

    // Test methods will be added here
    @Test
    void extractUsername_validToken_returnsCorrectUsername() {
        // Arrange
        String expectedUsername = "testuser";
        when(userPrincipal.getUsername()).thenReturn(expectedUsername);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        // Act
        String extractedUsername = jwtService.extractUsername(token);

        // Assert
        assertEquals(expectedUsername, extractedUsername);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void extractClaim_validToken_returnsCorrectClaim() {
        // Arrange
        String expectedUsername = "testuser";
        when(userPrincipal.getUsername()).thenReturn(expectedUsername);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        // Act
        String subject = jwtService.extractClaim(token, Claims::getSubject);
        Date issuedAt = jwtService.extractClaim(token, Claims::getIssuedAt);

        // Assert
        assertEquals(expectedUsername, subject);
        assertNotNull(issuedAt);
        assertTrue(issuedAt.before(new Date()) || issuedAt.equals(new Date()));
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void generateToken_validUserPrincipal_returnsNonEmptyToken() {
        // Arrange
        String expectedUsername = "testuser";
        when(userPrincipal.getUsername()).thenReturn(expectedUsername);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        // Act
        String token = jwtService.generateToken(userPrincipal);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // Check if it's a valid JWT format (header.payload.signature)
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void generateToken_withExtraClaims_returnsNonEmptyToken() {
        // Arrange
        String expectedUsername = "testuser";
        when(userPrincipal.getUsername()).thenReturn(expectedUsername);
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("customClaim", "customValue");

        // Act
        String token = jwtService.generateToken(extraClaims, userPrincipal);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3);
        
        Claims claims = jwtService.extractAllClaims(token);
        assertEquals("customValue", claims.get("customClaim"));
        
        verify(userPrincipal, times(1)).getUsername();
    }

    @Test
    void generateToken_userWithNoRole_throwsIllegalStateException() {
        // Arrange
        when(userPrincipal.getAuthorities()).thenReturn(Collections.emptyList());

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            jwtService.generateToken(userPrincipal);
        });

        assertEquals("User has no assigned role", exception.getMessage());
        verify(userPrincipal, times(1)).getAuthorities();
        verify(userPrincipal, never()).getUsername();
    }

    @Test
    void getJwtExpiration_returnsConfiguredValue() {
        // Arrange
        long expectedExpiration = JWT_EXPIRATION;

        // Act
        long actualExpiration = jwtService.getJwtExpiration();

        // Assert
        assertEquals(expectedExpiration, actualExpiration);
    }

    @Test
    void extractExpiration_validToken_returnsCorrectExpirationDate() {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        // Act
        Date expirationDate = jwtService.extractExpiration(token);

        // Assert
        assertNotNull(expirationDate);
        long expectedExpiration = System.currentTimeMillis() + JWT_EXPIRATION;
        long actualExpiration = expirationDate.getTime();
        // Allow for a small time difference (e.g., 1000 milliseconds) due to execution time
        assertTrue(Math.abs(expectedExpiration - actualExpiration) < 1000);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void extractExpiration_invalidToken_throwsException() {
        // Arrange
        String invalidToken = "invalid.token.string";

        // Act & Assert
        assertThrows(Exception.class, () -> jwtService.extractExpiration(invalidToken));
    }

    @Test
    void isTokenExpired_validNonExpiredToken_returnsFalse() {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        // Act
        @SuppressWarnings("null")
        boolean isExpired = ReflectionTestUtils.invokeMethod(jwtService, "isTokenExpired", token);

        // Assert
        assertFalse(isExpired);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void isTokenExpired_expiredToken_returnsTrue() throws Exception {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        
        // Set a very short expiration time for this test
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1); // 1 millisecond
        String token = jwtService.generateToken(userPrincipal);
        
        // Wait for the token to expire
        Thread.sleep(10); // Wait for 10 milliseconds to ensure the token has expired

        // Act
        Boolean result = ReflectionTestUtils.invokeMethod(jwtService, "isTokenExpired", token);

        // Assert
        assertNotNull(result);
        assertTrue(result);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
    }

    @Test
    void isTokenValid_validTokenAndMatchingUserDetails_returnsTrue() {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn(username);

        // Act
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Assert
        assertTrue(isValid);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
        verify(userDetails, times(1)).getUsername();
    }

    @Test
    void isTokenValid_validTokenButDifferentUsername_returnsFalse() {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        String token = jwtService.generateToken(userPrincipal);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("differentuser");

        // Act
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Assert
        assertFalse(isValid);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
        verify(userDetails, times(1)).getUsername();
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() throws Exception {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        
        // Set a very short expiration time for this test
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1); // 1 millisecond
        String token = jwtService.generateToken(userPrincipal);
        
        // Wait for the token to expire
        Thread.sleep(10); // Wait for 10 milliseconds to ensure the token has expired

        UserDetails userDetails = mock(UserDetails.class);

        // Act
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Assert
        assertFalse(isValid);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
        // We don't verify userDetails.getUsername() because it might not be called due to the exception
    }

    @Test
    void isTokenValid_expiredTokenThrowsException_returnsFalse() throws Exception {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        
        // Set a very short expiration time for this test
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1); // 1 millisecond
        String token = jwtService.generateToken(userPrincipal);
        
        // Wait for the token to expire
        Thread.sleep(10); // Wait for 10 milliseconds to ensure the token has expired

        UserDetails userDetails = mock(UserDetails.class);

        // Mock the extractUsername method to throw ExpiredJwtException
        JwtService spyJwtService = spy(jwtService);
        doThrow(new ExpiredJwtException(null, null, "Token expired"))
            .when(spyJwtService).extractUsername(token);

        // Act
        boolean isValid = spyJwtService.isTokenValid(token, userDetails);

        // Assert
        assertFalse(isValid);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
        verify(spyJwtService).extractUsername(token);
        verify(userDetails, never()).getUsername();
    }

    @Test
    void isTokenValid_expiredTokenWithMatchingUsername_returnsFalse() throws Exception {
        // Arrange
        String username = "testuser";
        when(userPrincipal.getUsername()).thenReturn(username);
        when(userPrincipal.getAuthorities()).thenReturn(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        
        // Generate a token that won't expire immediately
        String token = jwtService.generateToken(userPrincipal);
    
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn(username); // Matching username
    
        // Create a spy of the JwtService to manipulate the isTokenExpired method
        JwtService spyJwtService = spy(jwtService);
        doReturn(true).when(spyJwtService).isTokenExpired(token);
    
        // Act
        boolean isValid = spyJwtService.isTokenValid(token, userDetails);
    
        // Assert
        assertFalse(isValid);
        verify(userPrincipal, times(1)).getUsername();
        verify(userPrincipal, times(1)).getAuthorities();
        verify(userDetails, times(1)).getUsername();
        verify(spyJwtService, times(1)).isTokenExpired(token);
    }












}