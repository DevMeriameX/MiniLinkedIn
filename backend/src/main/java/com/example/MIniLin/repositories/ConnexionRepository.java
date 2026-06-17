package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Connexion;
import com.example.MIniLin.models.StatutConnexion;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnexionRepository extends JpaRepository<Connexion, Long> {
    
    List<Connexion> findByDestinataireIdAndStatut(Long destinataireId, StatutConnexion statut);
    
    List<Connexion> findByDemandeurIdAndStatut(Long demandeurId, StatutConnexion statut);
    
    @Query("SELECT c FROM Connexion c WHERE (c.demandeur.id = :userId OR c.destinataire.id = :userId) AND c.statut = 'ACCEPTEE'")
    List<Connexion> findAcceptedConnexions(@Param("userId") Long userId);

    Long countByDemandeurIdOrDestinataireIdAndStatut(
            Long demandeurId,
            Long destinataireId,
            StatutConnexion statut
    );

    @Query("SELECT c FROM Connexion c WHERE (c.demandeur.id = :demandeurId AND c.destinataire.id = :destinataireId) OR (c.demandeur.id = :destinataireId AND c.destinataire.id = :demandeurId)")
    Optional<Connexion> findExistingConnexion(@Param("demandeurId") Long demandeurId, @Param("destinataireId") Long destinataireId);
}
