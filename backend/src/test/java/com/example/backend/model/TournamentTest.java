package com.example.backend.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TournamentTest {

    private Tournament tournament;

    @BeforeEach
    void setUp() {
        tournament = new Tournament();
    }

    @Test
    void isValidEloRange_WithValidRange_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertTrue(result);
    }

    @Test
    void isValidEloRange_WithInvalidRange_ShouldReturnFalse() {
        // Arrange
        tournament.setMinElo(2000);
        tournament.setMaxElo(1000);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertFalse(result);
    }

    @Test
    void isValidEloRange_WithEqualMinAndMaxElo_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(1500);
        tournament.setMaxElo(1500);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertTrue(result);
    }

    @Test
    void isValidEloRange_WithNullValues_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(null);
        tournament.setMaxElo(null);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertTrue(result);
    }

    @Test
    void isEloRangeProvided_WithBothValuesProvided_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(1000);
        tournament.setMaxElo(2000);

        // Act
        boolean result = tournament.isEloRangeProvided();

        // Assert
        assertTrue(result);
    }

    @Test
    void isEloRangeProvided_WithOnlyMinEloProvided_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(1000);
        tournament.setMaxElo(null);

        // Act
        boolean result = tournament.isEloRangeProvided();

        // Assert
        assertTrue(result);
    }

    @Test
    void isEloRangeProvided_WithOnlyMaxEloProvided_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(null);
        tournament.setMaxElo(2000);

        // Act
        boolean result = tournament.isEloRangeProvided();

        // Assert
        assertTrue(result);
    }

    @Test
    void isEloRangeProvided_WithNeitherValueProvided_ShouldReturnFalse() {
        // Arrange
        tournament.setMinElo(null);
        tournament.setMaxElo(null);

        // Act
        boolean result = tournament.isEloRangeProvided();

        // Assert
        assertFalse(result);
    }

    @Test
    void isValidEloRange_WithOnlyMinEloProvided_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(1000);
        tournament.setMaxElo(null);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertTrue(result);
    }

    @Test
    void isValidEloRange_WithOnlyMaxEloProvided_ShouldReturnTrue() {
        // Arrange
        tournament.setMinElo(null);
        tournament.setMaxElo(2000);

        // Act
        boolean result = tournament.isValidEloRange();

        // Assert
        assertTrue(result);
    }

}
