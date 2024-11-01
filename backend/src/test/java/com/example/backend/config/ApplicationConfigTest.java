package com.example.backend.config;

import com.example.backend.model.User;
import com.example.backend.model.Admin;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AdminRepository;
import com.example.backend.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationConfigTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdminRepository adminRepository;

    @InjectMocks
    private ApplicationConfig applicationConfig;

    private UserDetailsService userDetailsService;

    @BeforeEach
    void setUp() {
        userDetailsService = applicationConfig.userDetailsService();
    }

    @Test
    void userDetailsService_WithExistingUser_ShouldReturnUserPrincipal() {
        // Arrange
        String username = "testuser";
        User user = new User();
        user.setUsername(username);
        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        // Assert
        assertNotNull(userDetails);
        assertTrue(userDetails instanceof UserPrincipal);
        assertEquals(username, userDetails.getUsername());
        verify(userRepository).findByUsername(username);
        verify(adminRepository, never()).findByAdminName(anyString());
    }

    @Test
    void userDetailsService_WithExistingAdmin_ShouldReturnUserPrincipal() {
        // Arrange
        String adminName = "testadmin";
        Admin admin = new Admin();
        admin.setAdminName(adminName);
        when(userRepository.findByUsername(adminName)).thenReturn(Optional.empty());
        when(adminRepository.findByAdminName(adminName)).thenReturn(Optional.of(admin));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername(adminName);

        // Assert
        assertNotNull(userDetails);
        assertTrue(userDetails instanceof UserPrincipal);
        assertEquals(adminName, userDetails.getUsername());
        verify(userRepository).findByUsername(adminName);
        verify(adminRepository).findByAdminName(adminName);
    }

    @Test
    void userDetailsService_WithNonExistentUser_ShouldThrowUsernameNotFoundException() {
        // Arrange
        String username = "nonexistent";
        when(userRepository.findByUsername(username)).thenReturn(Optional.empty());
        when(adminRepository.findByAdminName(username)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername(username));
        verify(userRepository).findByUsername(username);
        verify(adminRepository).findByAdminName(username);
    }

    @Test
    void passwordEncoder_ShouldReturnBCryptPasswordEncoder() {
        // Act
        BCryptPasswordEncoder passwordEncoder = applicationConfig.passwordEncoder();

        // Assert
        assertNotNull(passwordEncoder);
        assertTrue(passwordEncoder instanceof BCryptPasswordEncoder);
    }

    @Test
    void authenticationProvider_ShouldReturnConfiguredDaoAuthenticationProvider() {
        // Act
        var authProvider = applicationConfig.authenticationProvider();

        // Assert
        assertNotNull(authProvider);
        assertTrue(authProvider instanceof org.springframework.security.authentication.dao.DaoAuthenticationProvider);
    }
}
