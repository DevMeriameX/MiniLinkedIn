package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Offre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface OffreRepository extends JpaRepository<Offre, Long> {

  
  
    List<Offre> findByStatutOrderByDatePublicationDesc(String status);    
    
    List<Offre> findByEnseignantIdOrderByDatePublicationDesc(Long enseignantId);
    
    @Query("SELECT o FROM Offre o WHERE o.enseignant.id = :enseignantId " +
           "AND (:statut IS NULL OR o.statut = :statut) " +
           "AND (:types IS NULL OR o.type IN :types) " +
           "ORDER BY o.datePublication DESC")
    List<Offre> filterOffres(@Param("enseignantId") Long enseignantId, 
                             @Param("statut") String statut, 
                             @Param("types") List<String> types);
}
