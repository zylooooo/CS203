package com.example.backend.service;

import com.example.backend.dto.AdminLoginDto;
import com.example.backend.dto.AdminRegisterDto;
import com.example.backend.dto.AdminVerifyDto;
import com.example.backend.dto.UserLoginDto;
import com.example.backend.dto.UserRegisterDto;
import com.example.backend.dto.UserVerifyDto;
import com.example.backend.exception.AccountNotFoundException;
import com.example.backend.exception.AdminAlreadyVerifiedException;
import com.example.backend.exception.AdminNotEnabledException;
import com.example.backend.exception.AdminNotFoundException;
import com.example.backend.exception.EmailSendingException;
import com.example.backend.exception.InvalidVerificationCodeException;
import com.example.backend.exception.UserAlreadyVerifiedException;
import com.example.backend.exception.UserNotEnabledException;
import com.example.backend.exception.UserNotFoundException;
import com.example.backend.exception.VerificationCodeExpiredException;
import com.example.backend.model.Admin;
import com.example.backend.model.User;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.UserPrincipal;

import jakarta.mail.MessagingException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.*;
import java.util.*;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private AdminRepository adminRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;
    @Mock
    private LocalValidatorFactoryBean validator;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authenticationService;

    private UserRegisterDto validUserDto;
    private AdminRegisterDto validAdminDto;
    /*
     * Unit test for the userSignup method in the AuthenticationService class.
     * This test checks the following scenarios:
     * 1. Successful user signup
     * 2. Validation errors
     * 3. Username already exists
     * 4. Email already exists
     * 5. Unexpected exception
     * 6. Username exists in Admin repository
     * 7. Email exists in Admin repository
     */


    @BeforeEach
    void setUp() {
        validUserDto = new UserRegisterDto();
        validUserDto.setUsername("testuser");
        validUserDto.setEmail("test@example.com");
        validUserDto.setPassword("password123");
        validUserDto.setFirstName("John");
        validUserDto.setLastName("Doe");
        validUserDto.setPhoneNumber("1234567890");
        validUserDto.setElo(1000);
        validUserDto.setGender("Male");
        validUserDto.setDateOfBirth(LocalDate.of(1990, 1, 1));
        validUserDto.setAge(30);

        validAdminDto = new AdminRegisterDto();
        validAdminDto.setAdminName("testadmin");
        validAdminDto.setEmail("admin@example.com");
        validAdminDto.setPassword("adminpass123");
    }

    @Test
    void userSignup_Success_ReturnsUser() throws Exception {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("errors"));
        assertTrue(result.containsKey("user"));
        User savedUser = (User) result.get("user");
        assertEquals(validUserDto.getUsername(), savedUser.getUsername());
        assertEquals(validUserDto.getEmail(), savedUser.getEmail());
        assertEquals("encodedPassword", savedUser.getPassword());
        assertFalse(savedUser.isEnabled());
        assertNotNull(savedUser.getVerificationCode());
        assertNotNull(savedUser.getVerificationCodeExpiration());

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository).existsByEmail(validUserDto.getEmail());
        verify(passwordEncoder).encode(validUserDto.getPassword());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void userSignup_ValidationErrors() throws MessagingException {
        // Arrange
        doAnswer(invocation -> {
            Errors errors = invocation.getArgument(1);
            errors.rejectValue("username", "error.username", "Username is required");
            errors.rejectValue("email", "error.email", "Invalid email format");
            return null;
        }).when(validator).validate(any(UserRegisterDto.class), any(Errors.class));

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));

        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(2, errorMap.size());
        assertEquals("Username is required", errorMap.get("username"));
        assertEquals("Invalid email format", errorMap.get("email"));

        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void userSignup_UsernameAlreadyExists_ReturnsError() throws MessagingException {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(true);
        // We don't need to mock adminRepository.existsByAdminName() as it's not called if userRepository.existsByUsername() returns true
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Account name already exists", errorMap.get("username"));

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        // Remove this line as it's not called in the actual implementation
        // verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository).existsByEmail(validUserDto.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void userSignup_EmailAlreadyExists_ReturnsError() throws MessagingException {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);
        // We dont need to mock adminRepository.existsByEmail() as its not called if userRepository.existsByEmail() returns true

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Email already exists", errorMap.get("email"));

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository, never()).existsByEmail(validUserDto.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void userSignup_UnexpectedException_ReturnsError() throws MessagingException {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            authenticationService.userSignup(validUserDto);
        });

        assertEquals("Unexpected error", exception.getMessage());

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository).existsByEmail(validUserDto.getEmail());
        verify(passwordEncoder).encode(validUserDto.getPassword());
        verify(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void userSignup_UsernameExistsInAdminRepository_ReturnsError() throws MessagingException {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByAdminName(anyString())).thenReturn(true);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Account name already exists", errorMap.get("username"));

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository).existsByEmail(validUserDto.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void userSignup_EmailExistsInAdminRepository_ReturnsError() throws MessagingException {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(true);

        // Act
        Map<String, Object> result = authenticationService.userSignup(validUserDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Email already exists", errorMap.get("email"));

        verify(userRepository).existsByUsername(validUserDto.getUsername());
        verify(adminRepository).existsByAdminName(validUserDto.getUsername());
        verify(userRepository).existsByEmail(validUserDto.getEmail());
        verify(adminRepository).existsByEmail(validUserDto.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void verifyUser_Success() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("testuser");
        verifyDto.setVerificationCode("123456");

        User user = new User();
        user.setUsername("testuser");
        user.setEnabled(false);
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act
        authenticationService.verifyUser(verifyDto);

        // Assert
        assertTrue(user.isEnabled());
        assertNull(user.getVerificationCode());
        assertNull(user.getVerificationCodeExpiration());
        verify(userRepository).findByUsername("testuser");
        verify(userRepository).save(user);
    }

    @Test
    void verifyUser_UserNotFound() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("nonexistentuser");
        verifyDto.setVerificationCode("123456");

        when(userRepository.findByUsername("nonexistentuser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> authenticationService.verifyUser(verifyDto));
        verify(userRepository).findByUsername("nonexistentuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyUser_AlreadyVerified() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("testuser");
        verifyDto.setVerificationCode("123456");

        User user = new User();
        user.setUsername("testuser");
        user.setEnabled(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(UserAlreadyVerifiedException.class, () -> authenticationService.verifyUser(verifyDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyUser_ExpiredCode() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("testuser");
        verifyDto.setVerificationCode("123456");

        User user = new User();
        user.setUsername("testuser");
        user.setEnabled(false);
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiration(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(VerificationCodeExpiredException.class, () -> authenticationService.verifyUser(verifyDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyUser_InvalidCode() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("testuser");
        verifyDto.setVerificationCode("123456");

        User user = new User();
        user.setUsername("testuser");
        user.setEnabled(false);
        user.setVerificationCode("654321");
        user.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(5));

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(InvalidVerificationCodeException.class, () -> authenticationService.verifyUser(verifyDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void verifyUser_NullExpirationCode() {
        // Arrange
        UserVerifyDto verifyDto = new UserVerifyDto();
        verifyDto.setUsername("testuser");
        verifyDto.setVerificationCode("123456");

        User user = new User();
        user.setUsername("testuser");
        user.setEnabled(false);
        user.setVerificationCode("123456");
        user.setVerificationCodeExpiration(null);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(VerificationCodeExpiredException.class, () -> authenticationService.verifyUser(verifyDto));
        verify(userRepository).findByUsername("testuser");
        verify(userRepository, never()).save(any(User.class));
    }

    /*
     * Unit test for userAuthenticate method in the AuthenticationService class.
     * 
     * 1. Successful authentication
     * 2. User not found
     * 3. Incorrect password
     * 4. User not verified
     * 5. Unexpected exception
     */

     @Test
    void userAuthenticate_Success() {
        // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("testuser");
        loginDto.setPassword("password123");

        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setEnabled(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);

        // Act
        UserPrincipal result = authenticationService.userAuthenticate(loginDto);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void userAuthenticate_WithValidCredentials_ShouldReturnUserPrincipal() {
       // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("testuser");
        loginDto.setPassword("password123");
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setEnabled(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);

        // Act
        UserPrincipal result = authenticationService.userAuthenticate(loginDto);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void userAuthenticate_WithNonexistentUser_ShouldThrowUserNotFoundException() {
        // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("nonexistentuser");
        loginDto.setPassword("password123");
        when(userRepository.findByUsername("nonexistentuser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> authenticationService.userAuthenticate(loginDto));
        verify(userRepository).findByUsername("nonexistentuser");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void userAuthenticate_WithDisabledUser_ShouldThrowUserNotEnabledException() {
        // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("testuser");
        loginDto.setPassword("password123");
        
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setEnabled(false);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(UserNotEnabledException.class, () -> authenticationService.userAuthenticate(loginDto));
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void userAuthenticate_WithInvalidCredentials_ShouldThrowBadCredentialsException() {
        // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("testuser");
        loginDto.setPassword("wrongpassword");
        
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setEnabled(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid username or password"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authenticationService.userAuthenticate(loginDto));
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void userAuthenticate_WithUnexpectedException_ShouldPropagateException() {
        // Arrange
        UserLoginDto loginDto = new UserLoginDto();
        loginDto.setUsername("testuser");
        loginDto.setPassword("password123");
        
        User user = new User();
        user.setUsername("testuser");
        user.setPassword("encodedPassword");
        user.setEnabled(true);

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authenticationService.userAuthenticate(loginDto));
        verify(userRepository).findByUsername("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    /*
     * Unit test for the adminSignup method in the AuthenticationService class.
     * This test checks the following scenarios:
     * 1. Successful admin signup
     * 2. Validation errors
     * 3. Admin name already exists
     * 4. Email already exists
     * 5. Unexpected exception
     */

     @Test
    void adminSignup_Success_ReturnsAdmin() throws Exception {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(adminRepository.save(any(Admin.class))).thenAnswer(invocation -> invocation.getArgument(0));
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertFalse(result.containsKey("errors"));
        assertTrue(result.containsKey("admin"));
        Admin savedAdmin = (Admin) result.get("admin");
        assertEquals(validAdminDto.getAdminName(), savedAdmin.getAdminName());
        assertEquals(validAdminDto.getEmail(), savedAdmin.getEmail());
        assertEquals("encodedPassword", savedAdmin.getPassword());
        assertFalse(savedAdmin.isEnabled());
        assertNotNull(savedAdmin.getVerificationCode());
        assertNotNull(savedAdmin.getVerificationCodeExpiration());

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(userRepository).existsByUsername(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository).existsByEmail(validAdminDto.getEmail());
        verify(passwordEncoder).encode(validAdminDto.getPassword());
        verify(adminRepository).save(any(Admin.class));
        verify(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void adminSignup_ValidationErrors() throws MessagingException {
        // Arrange
        doAnswer(invocation -> {
            Errors errors = invocation.getArgument(1);
            errors.rejectValue("adminName", "error.adminName", "Admin name is required");
            errors.rejectValue("email", "error.email", "Invalid email format");
            return null;
        }).when(validator).validate(any(AdminRegisterDto.class), any(Errors.class));

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));

        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(2, errorMap.size());
        assertEquals("Admin name is required", errorMap.get("adminName"));
        assertEquals("Invalid email format", errorMap.get("email"));

        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void adminSignup_AdminNameAlreadyExists_ReturnsError() throws MessagingException {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(true);
        // We don't need to mock userRepository.existsByUsername() as it's not called if adminRepository.existsByAdminName() returns true
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Account name already exists", errorMap.get("adminName"));

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository).existsByEmail(validAdminDto.getEmail());
        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void adminSignup_UnexpectedException_ReturnsError() throws MessagingException {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        doNothing().when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
        when(adminRepository.save(any(Admin.class))).thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            authenticationService.adminSignup(validAdminDto);
        });

        assertEquals("Unexpected error", exception.getMessage());

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(userRepository).existsByUsername(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository).existsByEmail(validAdminDto.getEmail());
        verify(passwordEncoder).encode(validAdminDto.getPassword());
        verify(emailService).sendVerificationEmail(anyString(), anyString(), anyString());
        verify(adminRepository).save(any(Admin.class));
    }

    @Test
    void adminSignup_AdminNameExistsInUserRepository_ReturnsError() throws MessagingException {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(true);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Account name already exists", errorMap.get("adminName"));

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(userRepository).existsByUsername(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository).existsByEmail(validAdminDto.getEmail());
        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void adminSignup_EmailExistsInUserRepository_ReturnsError() throws MessagingException {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Email already exists", errorMap.get("email"));

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(userRepository).existsByUsername(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository).existsByEmail(validAdminDto.getEmail());
        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void adminSignup_EmailExistsInAdminRepository_ReturnsError() throws MessagingException {
        // Arrange
        when(adminRepository.existsByAdminName(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(adminRepository.existsByEmail(anyString())).thenReturn(true);
        // We don't need to mock userRepository.existsByEmail() as it's not called if adminRepository.existsByEmail() returns true

        // Act
        Map<String, Object> result = authenticationService.adminSignup(validAdminDto);

        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("errors"));
        
        @SuppressWarnings("unchecked")
        Map<String, String> errorMap = (Map<String, String>) result.get("errors");
        assertEquals(1, errorMap.size());
        assertEquals("Email already exists", errorMap.get("email"));

        verify(adminRepository).existsByAdminName(validAdminDto.getAdminName());
        verify(userRepository).existsByUsername(validAdminDto.getAdminName());
        verify(adminRepository).existsByEmail(validAdminDto.getEmail());
        verify(userRepository, never()).existsByEmail(anyString());
        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }


    /*
     * Unit test for the adminAuthenticate method in the AuthenticationService class.
     * This test checks the following scenarios:
     * 1. Successful admin authentication
     * 2. Admin not found
     * 3. Admin not enabled
     * 4. Unexpected exception
     */

     @Test
    void adminAuthenticate_WithValidCredentials_ShouldReturnUserPrincipal() {
        // Arrange
        AdminLoginDto loginDto = new AdminLoginDto();
        loginDto.setAdminName("testadmin");
        loginDto.setPassword("password123");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setPassword("encodedPassword");
        admin.setEnabled(true);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);

        // Act
        UserPrincipal result = authenticationService.adminAuthenticate(loginDto);

        // Assert
        assertNotNull(result);
        assertEquals("testadmin", result.getUsername());
        verify(adminRepository).findByAdminName("testadmin");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void adminAuthenticate_WithNonexistentAdmin_ShouldThrowAdminNotFoundException() {
        // Arrange
        AdminLoginDto loginDto = new AdminLoginDto();
        loginDto.setAdminName("nonexistentadmin");
        loginDto.setPassword("password123");

        when(adminRepository.findByAdminName("nonexistentadmin")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AdminNotFoundException.class, () -> authenticationService.adminAuthenticate(loginDto));
        verify(adminRepository).findByAdminName("nonexistentadmin");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void adminAuthenticate_WithDisabledAdmin_ShouldThrowAdminNotEnabledException() {
        // Arrange
        AdminLoginDto loginDto = new AdminLoginDto();
        loginDto.setAdminName("testadmin");
        loginDto.setPassword("password123");
        
        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setPassword("encodedPassword");
        admin.setEnabled(false);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(AdminNotEnabledException.class, () -> authenticationService.adminAuthenticate(loginDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(authenticationManager, never()).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void adminAuthenticate_WithInvalidCredentials_ShouldThrowBadCredentialsException() {
        // Arrange
        AdminLoginDto loginDto = new AdminLoginDto();
        loginDto.setAdminName("testadmin");
        loginDto.setPassword("wrongpassword");
        
        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setPassword("encodedPassword");
        admin.setEnabled(true);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Invalid admin name or password"));

        // Act & Assert
        assertThrows(BadCredentialsException.class, () -> authenticationService.adminAuthenticate(loginDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void adminAuthenticate_WithUnexpectedException_ShouldPropagateException() {
        // Arrange
        AdminLoginDto loginDto = new AdminLoginDto();
        loginDto.setAdminName("testadmin");
        loginDto.setPassword("password123");
        
        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setPassword("encodedPassword");
        admin.setEnabled(true);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new RuntimeException("Unexpected error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> authenticationService.adminAuthenticate(loginDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }


    /*
     * Unit test for the verifyAdmin method in the AuthenticationService class.
     * This test checks the following scenarios:
     * 1. Successful admin verification
     * 2. Admin not found
     * 3. Admin already verified
     * 4. Expired verification code
     * 5. Invalid verification code
     * 
     */

     @Test
    void verifyAdmin_Success() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("testadmin");
        verifyDto.setVerificationCode("123456");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setEnabled(false);
        admin.setVerificationCode("123456");
        admin.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(5));

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act
        authenticationService.verifyAdmin(verifyDto);

        // Assert
        assertTrue(admin.isEnabled());
        assertNull(admin.getVerificationCode());
        assertNull(admin.getVerificationCodeExpiration());
        verify(adminRepository).findByAdminName("testadmin");
        verify(adminRepository).save(admin);
    }

    @Test
    void verifyAdmin_AdminNotFound() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("nonexistentadmin");
        verifyDto.setVerificationCode("123456");

        when(adminRepository.findByAdminName("nonexistentadmin")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AdminNotFoundException.class, () -> authenticationService.verifyAdmin(verifyDto));
        verify(adminRepository).findByAdminName("nonexistentadmin");
        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    void verifyAdmin_AlreadyVerified() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("testadmin");
        verifyDto.setVerificationCode("123456");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setEnabled(true);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(AdminAlreadyVerifiedException.class, () -> authenticationService.verifyAdmin(verifyDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    void verifyAdmin_ExpiredCode() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("testadmin");
        verifyDto.setVerificationCode("123456");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setEnabled(false);
        admin.setVerificationCode("123456");
        admin.setVerificationCodeExpiration(LocalDateTime.now().minusMinutes(1));

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(VerificationCodeExpiredException.class, () -> authenticationService.verifyAdmin(verifyDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    void verifyAdmin_InvalidCode() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("testadmin");
        verifyDto.setVerificationCode("123456");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setEnabled(false);
        admin.setVerificationCode("654321");
        admin.setVerificationCodeExpiration(LocalDateTime.now().plusMinutes(5));

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(InvalidVerificationCodeException.class, () -> authenticationService.verifyAdmin(verifyDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(adminRepository, never()).save(any(Admin.class));
    }

    @Test
    void verifyAdmin_NullExpirationCode() {
        // Arrange
        AdminVerifyDto verifyDto = new AdminVerifyDto();
        verifyDto.setAdminName("testadmin");
        verifyDto.setVerificationCode("123456");

        Admin admin = new Admin();
        admin.setAdminName("testadmin");
        admin.setEnabled(false);
        admin.setVerificationCode("123456");
        admin.setVerificationCodeExpiration(null);

        when(adminRepository.findByAdminName("testadmin")).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(VerificationCodeExpiredException.class, () -> authenticationService.verifyAdmin(verifyDto));
        verify(adminRepository).findByAdminName("testadmin");
        verify(adminRepository, never()).save(any(Admin.class));
    }

    /*
     * Unit test for the handleResendVerification(Object) method in the AuthenticationService class.
     * This test checks the following scenarios:
     * 1. Successful resend verification
     * 2. User not found
     * 3. User already verified
     * 4. Unexpected exception
     */

     @Test
    void resendVerificationCode_SuccessfulForUser() throws Exception {
        // Arrange
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        user.setEnabled(false);
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // Act
        authenticationService.resendVerificationCode(email);

        // Assert
        assertNotNull(user.getVerificationCode());
        assertNotNull(user.getVerificationCodeExpiration());
        verify(userRepository).findByEmail(email);
        verify(userRepository).save(user);
        verify(emailService).sendVerificationEmail(eq(email), anyString(), anyString());
    }

    @Test
    void resendVerificationCode_SuccessfulForAdmin() throws Exception {
        // Arrange
        String email = "admin@example.com";
        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setEnabled(false);
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(adminRepository.findByEmail(email)).thenReturn(Optional.of(admin));
        when(adminRepository.save(any(Admin.class))).thenReturn(admin);

        // Act
        authenticationService.resendVerificationCode(email);

        // Assert
        assertNotNull(admin.getVerificationCode());
        assertNotNull(admin.getVerificationCodeExpiration());
        verify(userRepository).findByEmail(email);
        verify(adminRepository).findByEmail(email);
        verify(adminRepository).save(admin);
        verify(emailService).sendVerificationEmail(eq(email), anyString(), anyString());
    }

    @Test
    void resendVerificationCode_AccountNotFound() throws MessagingException {
        // Arrange
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(adminRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AccountNotFoundException.class, () -> authenticationService.resendVerificationCode(email));
        verify(userRepository).findByEmail(email);
        verify(adminRepository).findByEmail(email);
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void resendVerificationCode_UserAlreadyVerified() throws MessagingException {
        // Arrange
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        user.setEnabled(true);
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(UserAlreadyVerifiedException.class, () -> authenticationService.resendVerificationCode(email));
        verify(userRepository).findByEmail(email);
        verify(userRepository, never()).save(any(User.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void resendVerificationCode_AdminAlreadyVerified() throws MessagingException {
        // Arrange
        String email = "admin@example.com";
        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setEnabled(true);
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(adminRepository.findByEmail(email)).thenReturn(Optional.of(admin));

        // Act & Assert
        assertThrows(AdminAlreadyVerifiedException.class, () -> authenticationService.resendVerificationCode(email));
        verify(userRepository).findByEmail(email);
        verify(adminRepository).findByEmail(email);
        verify(adminRepository, never()).save(any(Admin.class));
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void resendVerificationCode_EmailSendingFails() throws MessagingException {
        // Arrange
        String email = "user@example.com";
        User user = new User();
        user.setEmail(email);
        user.setEnabled(false);
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        doThrow(new MessagingException("Failed to send email")).when(emailService).sendVerificationEmail(anyString(), anyString(), anyString());

        // Act & Assert
        assertThrows(EmailSendingException.class, () -> authenticationService.resendVerificationCode(email));
        verify(userRepository).findByEmail(email);
        verify(emailService).sendVerificationEmail(eq(email), anyString(), anyString());
        
        // Verify that the user object was modified, even if it wasn't saved
        assertNotNull(user.getVerificationCode());
        assertNotNull(user.getVerificationCodeExpiration());
        
    }

    @Test
    void handleResendVerification_SuccessfulForAdmin() throws Exception {
        // Arrange
        String email = "admin@example.com";
        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setEnabled(false);
        
        when(adminRepository.save(any(Admin.class))).thenReturn(admin);

        // Act
        authenticationService.handleResendVerification(admin);

        // Assert
        assertNotNull(admin.getVerificationCode());
        assertNotNull(admin.getVerificationCodeExpiration());
        verify(adminRepository).save(admin);
        verify(emailService).sendVerificationEmail(eq(email), anyString(), anyString());
    }

}


    

