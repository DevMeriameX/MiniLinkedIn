package com.example.MIniLin.repositories;

import com.example.MIniLin.models.PasswordResetToken;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUtilisateur(User utilisateur);
    void deleteByUtilisateur(User utilisateur);
}