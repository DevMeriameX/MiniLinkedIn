package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface PublicationRepository extends JpaRepository<Publication, Long> {

    // Récupère toutes les publications triées par date décroissante
    List<Publication> findAllByOrderByDatePublicationDesc();

    // Compte le nombre total de publications
    long count();

    // Compte le nombre de publications selon leur statut (ex: VALIDE, EN_ATTENTE, REFUSE)
    long countByStatut(Publication.StatutPublication statut);

    // Compte le nombre de publications publiées après une certaine date
    long countByDatePublicationAfter(Date date);

    // Publications d'un utilisateur spécifique (ex: un enseignant) triées par date décroissante
    List<Publication> findByUtilisateurOrderByDatePublicationDesc(User enseignant);

    // Publications d'un utilisateur avec pagination
    Page<Publication> findByUtilisateur(User enseignant, Pageable pageable);

    // Publications selon un statut (sans ordre particulier)
    List<Publication> findByStatut(Publication.StatutPublication statut);

    // Publications selon un statut triées par date décroissante
    List<Publication> findByStatutOrderByDatePublicationDesc(Publication.StatutPublication statut);

    // Compte le nombre de publications d'un utilisateur
    long countByUtilisateur(User enseignant);

    // Supprime toutes les publications d'un utilisateur
    void deleteByUtilisateur(User enseignant);

    // Recherche de publications validées par mot‑clé dans le contenu
    @Query("SELECT p FROM Publication p WHERE p.statut = 'VALIDE' AND p.contenu LIKE %:keyword% ORDER BY p.datePublication DESC")
    List<Publication> rechercherPublications(@Param("keyword") String keyword);
}