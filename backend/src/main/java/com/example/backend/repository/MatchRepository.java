package com.example.backend.repository;

import com.example.backend.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MatchRepository extends MongoRepository<Match, String> {
    List<Match> findByTournamentName(String tournamentName);
}
