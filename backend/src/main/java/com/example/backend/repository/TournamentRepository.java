package com.example.backend.repository;

import com.example.backend.model.Tournament;
import org.springframework.data.mongodb.repository.*;

import java.util.*;
import java.time.LocalDate;

public interface TournamentRepository extends MongoRepository<Tournament, String> {
    Optional<Tournament> findByTournamentName(String tournamentName);
    boolean existsByTournamentName(String tournamentName);

    @Query("{'startDate': { $gte: ?0 }, 'isOngoing': true}")
    Optional<List<Tournament>> findOngoingTournaments(LocalDate currentDate);
}
