package com.example.backend.exception;

public class TournamentNotFoundException extends RuntimeException {
    public TournamentNotFoundException(String tournamentName) {
        super("Tournament not found with id: " + tournamentName);
    }
}
