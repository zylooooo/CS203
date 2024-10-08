package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LocalValidatorFactoryBean validator;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * Fetch all the users from the database asynchronously.
     *
     * @return a CompletableFuture containing a list of Users. The list will be
     *         empty if no users are found.
     * @throws RuntimeException if there is an error fetching users from the
     *                          database.
     */
    @Async("taskExecutor")
    public CompletableFuture<List<User>> getAllUsers() throws RuntimeException {
        return CompletableFuture.supplyAsync(() -> {
            try {
                List<User> users = userRepository.findAll();
                logger.info("Retrieved {} users", users.size());
                return users;
            } catch (Exception e) {
                logger.error("Error fetching all users", e);
                throw new RuntimeException("Error fetching users", e);
            }
        });
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Asynchronously checks if the provided username exists in the database.
     *
     * @param userName the username to check
     * @return a CompletableFuture containing true if the username exists, false otherwise
     * @throws IllegalArgumentException if the username is null or empty
     */
    @Async("taskExecutor")
    public CompletableFuture<Boolean> checkIfUserNameExists(String userName) {
        return CompletableFuture.supplyAsync(() -> {
            if (userName == null || userName.isEmpty()) {
                throw new IllegalArgumentException("Username must be provided!");
            }
            return userRepository.existsByUserName(userName);
        });
    }
    
    /**
     * Asynchronously checks if the provided email exists in the database.
     *
     * @param email the email to check
     * @return a CompletableFuture containing true if the email exists, false otherwise
     * @throws IllegalArgumentException if the email is null or empty
     */
    @Async("taskExecutor")
    public CompletableFuture<Boolean> checkIfEmailExists(String email) {
        return CompletableFuture.supplyAsync(() -> {
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Email must be provided!");
            }
            return userRepository.existsByEmail(email);
        });
    }

    /**
     * Create a new user in the database asynchronously.
     * This method performs validation on the user data and checks for the
     * uniqueness of the email and username.
     *
     * @param user the User object containing the details of the user to be created.
     * @return a CompletableFuture containing the newly created User.
     * @throws IllegalArgumentException if the user data is invalid or if the email
     *                                  or username already exists for the
     *                                  controller to handle
     * @throws RuntimeException         if there is an unexpected error during user
     *                                  creation for the controller to handle
     */
    @Async("taskExecutor")
    public CompletableFuture<User> createUser(User user) throws IllegalArgumentException, RuntimeException {
        return CompletableFuture.supplyAsync(() -> {
            try {
                Errors errors = new BeanPropertyBindingResult(user, "user");
                validator.validate(user, errors);

                // Check for email and username uniqueness
                if (userRepository.existsByEmail(user.getEmail())) {
                    errors.rejectValue("email", "duplicate.email", "Email already exists");
                }
                if (userRepository.existsByUserName(user.getUserName())) {
                    errors.rejectValue("userName", "duplicate.userName", "Username already exists");
                }

                // Add any errors into a list and throw as an exception
                if (errors.hasErrors()) {
                    List<String> errorMessages = errors.getAllErrors().stream()
                            .map(error -> error.getDefaultMessage())
                            .collect(Collectors.toList());
                    throw new IllegalArgumentException("Invalid user data: " + String.join(", ", errorMessages));
                }

                User createdUser = userRepository.save(user);
                logger.info("User created successfully: {}", createdUser.getUserName());
                return createdUser;
            } catch (IllegalArgumentException e) {
                // Throw the exception with the original message to be handled by the controller
                logger.error("Validation errors during user creation: {}", e.getMessage(), e);
                throw new IllegalArgumentException(e.getMessage(), e);
            } catch (Exception e) {
                logger.error("Error creating user: " + e.getMessage(), e);
                throw new RuntimeException(e.getMessage(), e);
            }
        });
    }

    /**
     * Asynchronously updates a user's details based on the provided user name
     * 
     * This method retrieves the user, validates the new details, and updates the user's information.
     * The strikeReport and participatedTournaments field are intentionally left out becuase the users should not be able to update that.
     * It returns an updated User Object.
     * 
     * @param userName
     * @param newUserDetails
     * @return a CompletableFuture with the updated User Object
     * @throws UserNotFoundException
     * @throws IllegalArgumentException
     * @throws RuntimeException
     */
    @Async("taskExecutor")
    public CompletableFuture<User> updateUser(String userName, User newUserDetails)
            throws UserNotFoundException, IllegalArgumentException, RuntimeException {
        return CompletableFuture.supplyAsync(() -> {
            try {
                User user = userRepository.findByUserName(userName)
                        .orElseThrow(() -> new UserNotFoundException(userName));

                // Check if the newUserDetails has valid inputs
                Errors errors = new BeanPropertyBindingResult(newUserDetails, "user");
                validator.validate(newUserDetails, errors);

                if (!user.getEmail().equals(newUserDetails.getEmail())
                        && userRepository.existsByEmail(newUserDetails.getEmail())) {
                    errors.rejectValue("email", "duplicate.email", "Email already exists");
                }
                if (!user.getUserName().equals(newUserDetails.getUserName())
                        && userRepository.existsByUserName(user.getUserName())) {
                    errors.rejectValue("userName", "duplicate.userName", "Username already exists");
                }

                if (errors.hasErrors()) {
                    List<String> errorMessages = errors.getAllErrors().stream()
                            .map(error -> error.getDefaultMessage())
                            .collect(Collectors.toList());
                    throw new IllegalArgumentException("Invalid user data: " + String.join(", ", errorMessages));
                }

                // Update the user details
                user.setEmail(newUserDetails.getEmail());
                user.setPassword(newUserDetails.getPassword());
                user.setPhoneNumber(newUserDetails.getPhoneNumber());
                user.setElo(newUserDetails.getElo());
                user.setGender(newUserDetails.getGender());
                user.setDateOfBirth(newUserDetails.getDateOfBirth());
                user.setMedicalInformation(newUserDetails.getMedicalInformation());
                user.setProfilePic(newUserDetails.getProfilePic());
                user.setUserName(newUserDetails.getUserName());
                user.setFirstName(newUserDetails.getFirstName());
                user.setLastName(newUserDetails.getLastName());
                user.setAvailable(newUserDetails.isAvailable());
                
                logger.info("User updated successfully: {}", userName);
                return userRepository.save(user);
            } catch (IllegalArgumentException e) {
                logger.error("Validation errors during user update: {}", e.getMessage(), e);
                throw new IllegalArgumentException(e.getMessage(), e);
            } catch (Exception e) {
                logger.error("Unexpected error during user update: {}", e.getMessage(), e);
                throw new RuntimeException(e.getMessage(), e);
            }
        });
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Async("taskExecutor")
    public CompletableFuture<User> authenticateUser(String username, String password) {
        return CompletableFuture.supplyAsync(() -> {
            Optional<User> userOptional = userRepository.findByUserName(username);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                if (passwordEncoder.matches(password, user.getPassword())) {
                    return user;
                }
            }
            return null;
        });
    }
}
