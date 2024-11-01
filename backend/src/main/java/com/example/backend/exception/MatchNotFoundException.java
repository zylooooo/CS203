package com.example.backend.exception;

public class MatchNotFoundException extends RuntimeException {
    public MatchNotFoundException(String tournamentName) {
        super("No matches found for tournament " + tournamentName + "!");
    }

    public MatchNotFoundException() {
        super("No matches found!");
    }
}
