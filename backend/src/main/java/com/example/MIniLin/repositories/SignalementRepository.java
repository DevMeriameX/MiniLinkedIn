package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Signalement;
import com.example.MIniLin.models.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    List<Signalement> findByStatut(Signalement.StatutSignalement statut);
    List<Signalement> findAllByOrderByDateSignalementDesc();
    long countByStatut(Signalement.StatutSignalement statut);

    @Transactional
    void deleteByPublication(Publication publication);
}