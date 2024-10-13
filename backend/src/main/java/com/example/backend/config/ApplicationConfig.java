package com.example.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
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

@Configuration
public class ApplicationConfig {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public ApplicationConfig(UserRepository userRepository, AdminRepository adminRepository) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

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

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean 
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

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
