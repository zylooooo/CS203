package com.example.backend.exception;

public class TournamentNotFoundException extends RuntimeException {
    // Exception for when a tournament is not found by its name
    public TournamentNotFoundException(String tournamentName) {
        super("Tournament not found with id: " + tournamentName);
    }

    // Exception for when no tournaments are found (repository is empty)
    public TournamentNotFoundException() {
        super("No tournaments found in the repository!");
    }
}
