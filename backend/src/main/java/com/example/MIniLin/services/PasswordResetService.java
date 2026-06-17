package com.example.MIniLin.services;

import com.example.MIniLin.models.PasswordResetToken;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.PasswordResetTokenRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Créer token (sans envoyer d'email)
    public String creerTokenReinitialisation(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email non trouvé"));

        tokenRepository.deleteByUtilisateur(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, user);
        tokenRepository.save(resetToken);

        // Retourne le token (l'admin le donne à l'utilisateur)
        return token;
    }

    public void reinitialiserMotDePasse(String token, String nouveauMotDePasse) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (resetToken.isUtilise()) {
            throw new RuntimeException("Ce token a déjà été utilisé");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Ce token a expiré");
        }

        User user = resetToken.getUtilisateur();
        user.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        userRepository.save(user);

        resetToken.setUtilise(true);
        tokenRepository.save(resetToken);
    }
}