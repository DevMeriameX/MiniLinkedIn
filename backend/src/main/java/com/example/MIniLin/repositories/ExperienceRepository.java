package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Experience;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByUtilisateur(User utilisateur);
}
