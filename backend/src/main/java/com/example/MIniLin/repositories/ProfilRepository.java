package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Profil;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfilRepository extends JpaRepository<Profil, Long> {
    Optional<Profil> findByUtilisateur(User utilisateur);
}
