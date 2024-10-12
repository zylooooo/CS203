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

    @Query("{ $or: [ " +
           "    { 'startDate': { $gt: ?0 }, 'isOngoing': true }, " +  // Future tournaments
           "    { 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 }, 'isOngoing': true }" +  // Ongoing tournaments
           "] }")
    Optional<List<Tournament>> findOngoingAndFutureTournaments(LocalDate currentDate);
}
