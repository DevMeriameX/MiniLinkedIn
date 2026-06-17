package com.example.MIniLin.services;

import com.example.MIniLin.config.JwtUtil;   // IMPORT CORRIGÉ
import com.example.MIniLin.dtos.LoginRequest;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;   // injection correcte

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        if (!user.isActif()) {
            throw new RuntimeException("Compte désactivé. Contactez l'administrateur.");
        }

        // mise à jour de la date de dernière connexion
        user.setLastLogin(new Date());
        userRepository.save(user);

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    public User register(String email, String password, String nomComplet, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email déjà utilisé");
        }
        User user = new User();
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(password));
        user.setNomComplet(nomComplet);
        user.setRole(role);
        user.setActif(role == Role.ADMIN); // Admin actif immédiatement
        user.setDateInscription(new Date());
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getComptesEnAttente() {
        return userRepository.findByActifFalse();
    }

    public User activerCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(true);
        return userRepository.save(user);
    }

    public User desactiverCompte(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        user.setActif(false);
        return userRepository.save(user);
    }
}