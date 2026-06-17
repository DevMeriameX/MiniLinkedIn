package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Recommandation;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecommandationRepository extends JpaRepository<Recommandation, Long> {
    List<Recommandation> findByEtudiantOrderByDateRecommandationDesc(User etudiant);
    boolean existsByEnseignantAndEtudiant(User enseignant, User etudiant);
}
