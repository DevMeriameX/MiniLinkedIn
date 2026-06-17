// ReactionRepository.java
package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Reaction;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    long countByPublication(Publication publication);
    void deleteByPublication(Publication publication);

    List<Reaction> findByPublication(Publication publication);
    Optional<Reaction> findByPublicationAndUtilisateur(Publication publication, User utilisateur);
}