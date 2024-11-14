package com.example.backend.config;

import java.io.IOException;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import com.example.backend.security.UserPrincipal;
import com.example.backend.service.JwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Filter component that handles JWT-based authentication for incoming requests.
 * Validates JWT tokens and sets up Spring Security context for authenticated users.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    /**
     * Constructs a JwtAuthenticationFilter with required services.
     *
     * @param jwtService Service for JWT token operations
     * @param userDetailsService Service for loading user details
     */
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }    

    /**
     * Processes each incoming HTTP request to validate JWT tokens and authenticate users.
     * Extracts JWT from Authorization header, validates it, and sets up security context.
     *
     * @param request The HTTP request
     * @param response The HTTP response
     * @param filterChain The filter chain for request processing
     * @throws ServletException If a servlet error occurs
     * @throws IOException If an I/O error occurs
     */
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request, 
            @NonNull HttpServletResponse response, 
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No valid Authorization header found");
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);
            final String username = jwtService.extractUsername(jwt);

            logger.debug("Extracted username from JWT: {}", username);

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (username != null && authentication == null) {   
                UserPrincipal userPrincipal = (UserPrincipal) this.userDetailsService.loadUserByUsername(username);
            
                if (jwtService.isTokenValid(jwt, userPrincipal)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userPrincipal, 
                        null, 
                        userPrincipal.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set for user: {} with authorities: {}", 
                        username, 
                        userPrincipal.getAuthorities());
                } else {
                    logger.debug("Token is not valid for user: {}", username);
                }
            }

            filterChain.doFilter(request, response);
        } catch (SignatureException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT signature");
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "JWT token is expired");
        } catch (Exception e) {
            logger.error("Error occurred during JWT authentication", e);
            sendErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An error occurred during authentication");
        }
    }

    /**
     * Sends an error response to the client with the specified status and message.
     *
     * @param response The HTTP response
     * @param status The HTTP status code
     * @param message The error message
     * @throws IOException If an I/O error occurs while writing the response
     */
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String jsonResponse = String.format("{\"error\": \"%s\"}", message);
        response.getWriter().write(jsonResponse);
    }
}

