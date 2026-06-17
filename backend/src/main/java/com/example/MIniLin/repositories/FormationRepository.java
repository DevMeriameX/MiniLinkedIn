package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Formation;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FormationRepository extends JpaRepository<Formation, Long> {
    List<Formation> findByUtilisateur(User utilisateur);
}
