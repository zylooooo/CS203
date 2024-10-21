package com.example.backend.repository;

import com.example.backend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface MatchRepository extends MongoRepository<Match, String> {
    Optional<List<Match>> findByTournamentName(String tournamentName);
}
