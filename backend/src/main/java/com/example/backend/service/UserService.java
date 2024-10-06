package com.example.backend.service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final LocalValidatorFactoryBean validator;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    /**
     * Fetch all the users from the database
     * @return List of Users
     */
    @Async("taskExecutor")
    public CompletableFuture<List<User>> getAllUsers() {
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

    /**
     * Fetch a user by their ID
     * @param id
     * @return Optional<User>
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Creating a new user
     * Check for valid user detials input and at the same time check for uniqueness of the email and username
     * @param user
     * @return newly created User
     */
    @Async("taskExecutor")
    public CompletableFuture<User> createUser(User user) {
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

    public User updateUser(String id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (!user.getEmail().equals(userDetails.getEmail()) && userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (!user.getUserName().equals(userDetails.getUserName())
                && userRepository.existsByUserName(userDetails.getUserName())) {
            throw new RuntimeException("Username already exists");
        }

        user.setEmail(userDetails.getEmail());
        user.setPassword(userDetails.getPassword());
        user.setPhoneNumber(userDetails.getPhoneNumber());
        user.setElo(userDetails.getElo());
        user.setGender(userDetails.getGender());
        user.setDateOfBirth(userDetails.getDateOfBirth());
        user.setParticipatedTournaments(userDetails.getParticipatedTournaments());
        user.setMedicalInformation(userDetails.getMedicalInformation());
        user.setProfilePic(userDetails.getProfilePic());
        user.setUserName(userDetails.getUserName());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setAvailable(userDetails.isAvailable());
        user.setStrikeReport(userDetails.getStrikeReport());

        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
