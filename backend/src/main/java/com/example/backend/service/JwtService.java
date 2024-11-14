package com.example.backend.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.backend.security.UserPrincipal;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;


@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration}")
    private long jwtExpiration;


    /**
     * Extracts the username from the JWT token.
     *
     * @param token the JWT token from which to extract the username.
     * @return the username extracted from the token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); // Extract the subject (username) from the claims
    }

    /**
     * Extracts a specific claim from the JWT token.
     *
     * @param token          the JWT token from which to extract the claim.
     * @param claimsResolver a function to resolve the claim from the Claims object.
     * @param <T>           the type of the claim to be extracted.
     * @return the extracted claim.
     * @throws ExpiredJwtException if the token is expired.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) throws ExpiredJwtException {
        final Claims claims = extractAllClaims(token); // Extract all claims from the token
        return claimsResolver.apply(claims); // Apply the claims resolver function to get the specific claim
    }

    /**
     * Generates a JWT token for the specified user principal.
     *
     * @param userPrincipal the user principal for whom the token is generated.
     * @return the generated JWT token.
     */
    public String generateToken(UserPrincipal userPrincipal) {
        // Create a claims map to hold additional claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", userPrincipal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User has no assigned role"))); // Get the user's role

        return generateToken(claims, userPrincipal); // Generate the token with the claims and user principal
    }
    
    /**
     * Generates a JWT token with additional claims for the specified user principal.
     *
     * @param extraClaims    additional claims to include in the token.
     * @param userPrincipal  the user principal for whom the token is generated.
     * @return the generated JWT token.
     */
    public String generateToken(Map<String, Object> extraClaims, UserPrincipal userPrincipal) {
        return buildToken(extraClaims, userPrincipal, jwtExpiration); // Build the token with the claims and expiration
    }

    /**
     * Retrieves the JWT expiration time.
     *
     * @return the expiration time in milliseconds.
     */
    public long getJwtExpiration() {
        return jwtExpiration; // Return the configured JWT expiration time
    }

    /**
     * Builds the JWT token with the specified claims, user principal, and expiration time.
     *
     * @param extraClaims    additional claims to include in the token.
     * @param userPrincipal  the user principal for whom the token is generated.
     * @param expiration     the expiration time in milliseconds.
     * @return the generated JWT token.
     */
    private String buildToken(Map<String, Object> extraClaims, UserPrincipal userPrincipal, long expiration) {
        return Jwts.builder()
                .setClaims(extraClaims) // Set the claims
                .setSubject(userPrincipal.getUsername()) // Set the subject (username)
                .setIssuedAt(new Date(System.currentTimeMillis())) // Set the issued date
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // Set the expiration date
                .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Sign the token with the signing key
                .compact(); // Build the token
    }

    /**
     * Validates the JWT token against the provided user details.
     *
     * @param token      the JWT token to validate.
     * @param userDetails the user details to validate against.
     * @return true if the token is valid, false otherwise.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token); // Extract the username from the token
            return (username.equals(userDetails.getUsername())) && !isTokenExpired(token); // Validate the token
        } catch (ExpiredJwtException e) {
            return false; // Return false if the token is expired
        }
    }

    /**
     * Checks if the JWT token is expired.
     *
     * @param token the JWT token to check.
     * @return true if the token is expired, false otherwise.
     */
    boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date()); // Check if the expiration date is before the current date
        } catch (ExpiredJwtException e) {
            return true; // Return true if the token is expired
        }
    }

    /**
     * Extracts the expiration date from the JWT token.
     *
     * @param token the JWT token from which to extract the expiration date.
     * @return the expiration date.
     * @throws ExpiredJwtException if the token is expired.
     */
    Date extractExpiration(String token) throws ExpiredJwtException {
        return extractClaim(token, Claims::getExpiration); // Extract the expiration date from the claims
    }

    /**
     * Extracts all claims from the JWT token.
     *
     * @param token the JWT token from which to extract claims.
     * @return the claims extracted from the token.
     */
    Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey()) // Set the signing key
                .build()
                .parseClaimsJws(token) // Parse the token
                .getBody(); // Get the claims body
    }
        

    /**
     * Retrieves the signing key used to sign the JWT token.
     *
     * @return the signing key.
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey); // Decode the secret key from Base64
        return Keys.hmacShaKeyFor(keyBytes); // Generate the signing key
    }
}
