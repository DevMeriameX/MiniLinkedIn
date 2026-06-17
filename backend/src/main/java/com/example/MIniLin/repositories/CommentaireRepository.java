// CommentaireRepository.java
package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Commentaire;
import com.example.MIniLin.models.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    long countByPublication(Publication publication);
    void deleteByPublication(Publication publication);
    List<Commentaire> findByPublication(Publication publication);
    List<Commentaire> findByPublicationOrderByDateCommentaireDesc(Publication publication);
}