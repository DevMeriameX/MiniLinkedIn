package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Competence;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CompetenceRepository extends JpaRepository<Competence, Long> {
    List<Competence> findByUtilisateur(User utilisateur);
    boolean existsByUtilisateurIdAndNomContainingIgnoreCase(Long utilisateurId, String nom);
}
