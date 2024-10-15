package com.example.backend.service;

import com.example.backend.dto.UserRegisterDto;
import com.example.backend.model.User;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;

import jakarta.mail.MessagingException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDate;
import java.util.Map;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
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

    @InjectMocks
    private AuthenticationService authenticationService;

    private UserRegisterDto validUserDto;

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


}