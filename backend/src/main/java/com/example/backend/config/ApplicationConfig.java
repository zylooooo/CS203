package com.example.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.context.annotation.Bean;

import com.example.backend.model.User;
import com.example.backend.model.Admin;
import com.example.backend.security.UserPrincipal;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.AdminRepository;

/**
 * Configuration class for application-wide security settings and beans.
 * Handles user authentication, password encoding, and security providers.
 */
@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    /**
     * Constructs an ApplicationConfig with necessary repositories.
     *
     * @param userRepository Repository for user-related database operations
     * @param adminRepository Repository for admin-related database operations
     */
    public ApplicationConfig(UserRepository userRepository, AdminRepository adminRepository) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    /**
     * Creates a UserDetailsService bean for loading user-specific data.
     * Attempts to find a user first, then an admin if no user is found.
     *
     * @return UserDetailsService implementation for authentication
     * @throws UsernameNotFoundException if neither user nor admin is found
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            User user = userRepository.findByUsername(username)
                    .orElse(null);
            if (user != null) {
                return UserPrincipal.create(user);
            }

            Admin admin = adminRepository.findByAdminName(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));
            return UserPrincipal.create(admin);
        };
    }

    /**
     * Creates a BCryptPasswordEncoder bean for secure password hashing.
     *
     * @return BCryptPasswordEncoder instance for password encoding
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Creates an AuthenticationManager bean from the provided configuration.
     *
     * @param config The authentication configuration to use
     * @return AuthenticationManager instance
     * @throws Exception if the AuthenticationManager cannot be created
     */
    @Bean 
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Creates an AuthenticationProvider bean for handling authentication requests.
     * Configures the provider with the UserDetailsService and PasswordEncoder.
     *
     * @return Configured DaoAuthenticationProvider instance
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // Create a DaoAuthenticationProvider to authenticate users
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

        // Set the user details service and password encoder
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
