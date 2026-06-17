package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.*;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.services.AuthService;
import com.example.MIniLin.services.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:5174")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PasswordResetService passwordResetService;

    @Value("${file.upload-dir:uploads/utilisateurs}")
    private String uploadDir;

    // ========== LOGIN ==========
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            String token = authService.login(request);
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            LoginResponse response = new LoginResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getNomComplet(),
                    user.getRole().name(),
                    user.getPhoto()
            );
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    // ========== INSCRIPTION SIMPLIFIÉE (UN SEUL ENDPOINT) ==========
    @PostMapping(value = "/inscription", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerSimple(
            @RequestParam String email,
            @RequestParam String motDePasse,
            @RequestParam String nomComplet,
            @RequestParam String role,
            @RequestParam(required = false) MultipartFile document
    ) {
        try {
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
            }

            Role userRole;
            try {
                userRole = Role.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Role doit être ETUDIANT ou ENSEIGNANT"));
            }

            User user = authService.register(email, motDePasse, nomComplet, userRole);

            if (document != null && !document.isEmpty()) {
                String sousDossier = userRole == Role.ETUDIANT ? "etudiants" : "enseignants";
                String fileName = sauvegarderFichier(document, sousDossier);
                user.setDocument(fileName);
            }

            authService.updateUser(user);

            String message = userRole == Role.ENSEIGNANT
                    ? "Inscription réussie ! En attente d'activation par l'administrateur."
                    : "Inscription réussie !";

            return ResponseEntity.ok(Map.of(
                    "message", message,
                    "email", user.getEmail(),
                    "role", userRole.name(),
                    "status", userRole == Role.ENSEIGNANT ? "EN_ATTENTE" : "ACTIF"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========== ANCIENS ENDPOINTS CONSERVÉS POUR COMPATIBILITÉ ==========

    @PostMapping(value = "/inscription/etudiant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerEtudiant(
            @RequestParam String email,
            @RequestParam String motDePasse,
            @RequestParam String nomComplet,
            @RequestParam String filiere,
            @RequestParam(required = false) MultipartFile document
    ) {
        try {
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
            }

            User user = authService.register(email, motDePasse, nomComplet, Role.ETUDIANT);
            user.setFiliere(filiere);

            if (document != null && !document.isEmpty()) {
                String fileName = sauvegarderFichier(document, "etudiants");
                user.setDocument(fileName);
            }

            authService.updateUser(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Inscription réussie",
                    "email", user.getEmail(),
                    "role", "ETUDIANT"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/inscription/enseignant", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerEnseignant(
            @RequestParam String email,
            @RequestParam String motDePasse,
            @RequestParam String nomComplet,
            @RequestParam String labo,
            @RequestParam String depart,
            @RequestParam(required = false) MultipartFile document
    ) {
        try {
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
            }

            User user = authService.register(email, motDePasse, nomComplet, Role.ENSEIGNANT);
            user.setLabo(labo);
            user.setDepart(depart);

            if (document != null && !document.isEmpty()) {
                String fileName = sauvegarderFichier(document, "enseignants");
                user.setDocument(fileName);
            }

            authService.updateUser(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Inscription réussie ! En attente d'activation par l'administrateur.",
                    "email", user.getEmail(),
                    "role", "ENSEIGNANT",
                    "status", "EN_ATTENTE"
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la sauvegarde du fichier: " + e.getMessage()));
        }
    }

    // ========== ENDPOINTS ADMIN ==========

    @PostMapping("/mot-de-passe/oublie")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email requis"));
            }
            String token = passwordResetService.creerTokenReinitialisation(email);
            return ResponseEntity.ok(Map.of(
                    "message", "Token de reinitialisation genere",
                    "token", token
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mot-de-passe/reinitialiser")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String nouveauMotDePasse = request.get("nouveauMotDePasse");

            if (token == null || token.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Token requis"));
            }
            if (nouveauMotDePasse == null || nouveauMotDePasse.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Nouveau mot de passe requis"));
            }

            passwordResetService.reinitialiserMotDePasse(token, nouveauMotDePasse);
            return ResponseEntity.ok(Map.of("message", "Mot de passe reinitialise avec succes"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/comptes/en-attente")
    public ResponseEntity<?> getComptesEnAttente() {
        List<User> comptesEnAttente = authService.getComptesEnAttente();
        return ResponseEntity.ok(Map.of(
                "count", comptesEnAttente.size(),
                "users", comptesEnAttente
        ));
    }

    @GetMapping("/admin/utilisateurs")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "count", users.size(),
                "users", users
        ));
    }

    @PutMapping("/admin/activer/{userId}")
    public ResponseEntity<?> activerCompte(@PathVariable Long userId) {
        try {
            User user = authService.activerCompte(userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Compte activé avec succès",
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "status", "ACTIF"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/admin/desactiver/{userId}")
    public ResponseEntity<?> desactiverCompte(@PathVariable Long userId) {
        try {
            User user = authService.desactiverCompte(userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Compte désactivé avec succès",
                    "email", user.getEmail(),
                    "role", user.getRole().name(),
                    "status", "INACTIF"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/init/admin")
    public ResponseEntity<?> createDefaultAdmin() {
        try {
            String adminEmail = "admin@system.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setMotDePasse(passwordEncoder.encode("admin123"));
                admin.setNomComplet("Administrateur Système");
                admin.setRole(Role.ADMIN);
                admin.setActif(true);
                userRepository.save(admin);

                return ResponseEntity.ok(Map.of(
                        "message", "Admin créé avec succès",
                        "email", adminEmail,
                        "password", "admin123"
                ));
            }
            return ResponseEntity.ok(Map.of("message", "Admin existe déjà", "email", adminEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/debug/users")
    public ResponseEntity<?> debugUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(Map.of(
                "totalUsers", users.size(),
                "users", users.stream().map(u -> Map.of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "nomComplet", u.getNomComplet(),
                        "role", u.getRole().name(),
                        "actif", u.isActif()
                )).toList()
        ));
    }

    // ========== METHODE PRIVEE ==========
    private String sauvegarderFichier(MultipartFile file, String sousDossier) throws IOException {
        Path uploadPath = Paths.get(uploadDir, sousDossier);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return "/uploads/utilisateurs/" + sousDossier + "/" + fileName;
    }
}