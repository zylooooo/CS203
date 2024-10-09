package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Inject security credentials from environment variables or application properties
    @Value("${SPRING_SECURITY_USER}")
    private String user;

    @Value("${SPRING_SECURITY_USER_PASSWORD}")
    private String userPassword;

    @Value("${SPRING_SECURITY_ADMIN}")
    private String admin;

    @Value("${SPRING_SECURITY_ADMIN_PASSWORD}")
    private String adminPassword;

    /**
     * Configures the security filter chain for HTTP requests.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .addFilterAfter(new OtpVerificationFilter(), UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(requests -> requests
                .requestMatchers("/otp/verify", "/otp/send", "/css/**", "/js/**", "/images/**", "/users/login", "/admins/login", "users/signup").permitAll()
                .requestMatchers("/admins/**").hasRole("ADMIN")
                .requestMatchers("/users/**").hasRole("USER")
                .anyRequest().authenticated())
            .formLogin(login -> login
                .loginPage("/users/login")
                .successHandler(customSuccessHandler())
                .failureHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\": \"Authentication failed\"}");
                })
                .permitAll())
            .logout(logout -> logout
                .permitAll())
            .csrf(csrf -> csrf.ignoringRequestMatchers("/users/login", "/otp/send", "/otp/verify", "/admins/login", "/users/signup"));

        return http.build();
    }

    /**
     * Provides a custom authentication success handler.
     */
    @Bean
    public AuthenticationSuccessHandler customSuccessHandler() {
        return new CustomAuthenticationSuccessHandler();
    }

    /**
     * Configures the user details service with in-memory users.
     */
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
        if (user == null || userPassword == null || admin == null || adminPassword == null) {
            throw new IllegalStateException("Security credentials are not properly configured. Please check your environment variables or application properties.");
        }
    
        UserDetails userDetails = User.builder()
            .username(user)
            .password(passwordEncoder.encode(userPassword))
            .roles("USER")
            .build();
    
        UserDetails adminDetails = User.builder()
            .username(admin)
            .password(passwordEncoder.encode(adminPassword))
            .roles("ADMIN", "USER")
            .build();
    
        return new InMemoryUserDetailsManager(userDetails, adminDetails);
    }

    /**
     * Provides a password encoder for secure password storage.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}






