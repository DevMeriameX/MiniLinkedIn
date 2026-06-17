package com.example.MIniLin.repositories;

import com.example.MIniLin.models.StatutVerification;
import com.example.MIniLin.models.VerificationDiplome;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VerificationDiplomeRepository extends JpaRepository<VerificationDiplome, Long> {

  List<VerificationDiplome> findByStatut(StatutVerification statut);

  List<VerificationDiplome> findByEnseignantId(Long enseignantId);

  @Query("SELECT v FROM VerificationDiplome v WHERE v.statut = 'EN_ATTENTE' ORDER BY v.dateSoumission ASC")
  List<VerificationDiplome> findDocumentsEnAttente();

  // long countByStatut(StatutVerification statut);
  long countByEnseignantIdAndStatut(Long enseignantId, StatutVerification statut);
  
  long countByStatut(StatutVerification statut);
}