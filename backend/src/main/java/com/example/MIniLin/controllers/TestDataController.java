package com.example.MIniLin.controllers;

import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/test")
public class TestDataController {

    @Autowired private UserRepository userRepository;
    @Autowired private PublicationRepository publicationRepository;
    @Autowired private SignalementRepository signalementRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:uploads/utilisateurs}")
    private String uploadDir;

    // ========== ENDPOINTS EXISTANTS ==========
    @PostMapping("/publication")
    public ResponseEntity<?> createTestPublication(@RequestParam Long userId, @RequestParam String contenu) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Publication publication = new Publication();
        publication.setUtilisateur(user);
        publication.setContenu(contenu);
        publication.setStatut(Publication.StatutPublication.VALIDE);
        Publication saved = publicationRepository.save(publication);
        return ResponseEntity.ok(Map.of("message", "Publication créée", "publication", saved));
    }

    @PostMapping("/signalement")
    public ResponseEntity<?> createTestSignalement(@RequestParam Long publicationId, @RequestParam Long signaleurId, @RequestParam String raison) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));
        User signaleur = userRepository.findById(signaleurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur signaleur non trouvé"));
        Signalement signalement = new Signalement();
        signalement.setPublication(publication);
        signalement.setSignaleur(signaleur);
        signalement.setRaison(raison);
        signalement.setStatut(Signalement.StatutSignalement.EN_ATTENTE);
        Signalement saved = signalementRepository.save(signalement);
        return ResponseEntity.ok(Map.of("message", "Signalement créé", "signalement", saved));
    }

    // ========== NOUVEAUX ENDPOINTS POUR JEU DE DONNÉES ==========

    /** Génère un fichier texte factice pour simuler un document uploadé */
    private String sauvegarderFichierFictif(String sousDossier, String nomFichier) throws IOException {
        Path uploadPath = Paths.get(uploadDir, sousDossier);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID().toString() + "_" + nomFichier + ".txt";
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, ("Contenu factice pour " + nomFichier).getBytes());
        return "/uploads/utilisateurs/" + sousDossier + "/" + fileName;
    }

    /** Crée un utilisateur de test (rôle ETUDIANT ou ENSEIGNANT) avec document facultatif */
    @PostMapping("/user")
    public ResponseEntity<?> createTestUser(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String nomComplet,
            @RequestParam String role, // "ETUDIANT" ou "ENSEIGNANT"
            @RequestParam(required = false) String filiere,
            @RequestParam(required = false) String labo,
            @RequestParam(required = false) String depart) {

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email déjà utilisé"));
        }
        User user = new User();
        user.setEmail(email);
        user.setMotDePasse(passwordEncoder.encode(password));
        user.setNomComplet(nomComplet);
        user.setRole(Role.valueOf(role.toUpperCase()));
        user.setActif("ENSEIGNANT".equalsIgnoreCase(role) ? false : true); // enseignant en attente
        user.setDateInscription(new Date());
        if (filiere != null) user.setFiliere(filiere);
        if (labo != null) user.setLabo(labo);
        if (depart != null) user.setDepart(depart);
        // Générer un document factice
        try {
            String dossier = "ETUDIANT".equalsIgnoreCase(role) ? "etudiants" : "enseignants";
            String docUrl = sauvegarderFichierFictif(dossier, "document_" + email.replace("@", "_"));
            user.setDocument(docUrl);
        } catch (IOException e) {
            e.printStackTrace();
        }
        User saved = userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Utilisateur créé", "user", saved));
    }

    /** Crée plusieurs publications aléatoires pour un utilisateur */
    @PostMapping("/publications/bulk")
    public ResponseEntity<?> createBulkPublications(@RequestParam Long userId, @RequestParam int count) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        for (int i = 1; i <= count; i++) {
            Publication p = new Publication();
            p.setUtilisateur(user);
            p.setContenu("Publication test n°" + i + " de " + user.getNomComplet());
            p.setStatut(Publication.StatutPublication.VALIDE);
            p.setDatePublication(new Date());
            publicationRepository.save(p);
        }
        return ResponseEntity.ok(Map.of("message", count + " publications créées"));
    }

    /** Initialise un jeu de données complet pour la démonstration */
    @PostMapping("/init-demo")
    public ResponseEntity<?> initDemoData() {
        try {
            // 1. Admin de démo (si absent)
            if (!userRepository.existsByEmail("admin@demo.com")) {
                User adminDemo = new User();
                adminDemo.setEmail("admin@demo.com");
                adminDemo.setMotDePasse(passwordEncoder.encode("admin123"));
                adminDemo.setNomComplet("Admin Démo");
                adminDemo.setRole(Role.ADMIN);
                adminDemo.setActif(true);
                adminDemo.setDateInscription(new Date());
                userRepository.save(adminDemo);
            }

            // 2. Étudiants
            String[][] etudiants = {
                    {"etudiant1@demo.com", "Alice Martin", "Informatique"},
                    {"etudiant2@demo.com", "Bob Durand", "Mathématiques"},
                    {"etudiant3@demo.com", "Claire Lefèvre", "Biologie"}
            };
            for (String[] e : etudiants) {
                if (!userRepository.existsByEmail(e[0])) {
                    User u = new User();
                    u.setEmail(e[0]);
                    u.setMotDePasse(passwordEncoder.encode("pass123"));
                    u.setNomComplet(e[1]);
                    u.setRole(Role.ETUDIANT);
                    u.setFiliere(e[2]);
                    u.setActif(true);
                    u.setDateInscription(new Date());
                    String docUrl = sauvegarderFichierFictif("etudiants", "CV_" + e[1].replace(" ", "_"));
                    u.setDocument(docUrl);
                    userRepository.save(u);
                }
            }

            // 3. Enseignants (comptes en attente)
            String[][] enseignants = {
                    {"prof1@demo.com", "Dr. Sophie Laurent", "Physique", "Labo Physique Quantique"},
                    {"prof2@demo.com", "Dr. Marc Lefèvre", "Informatique", "Labo IA"}
            };
            for (String[] p : enseignants) {
                if (!userRepository.existsByEmail(p[0])) {
                    User u = new User();
                    u.setEmail(p[0]);
                    u.setMotDePasse(passwordEncoder.encode("pass123"));
                    u.setNomComplet(p[1]);
                    u.setRole(Role.ENSEIGNANT);
                    u.setDepart(p[2]);
                    u.setLabo(p[3]);
                    u.setActif(false);
                    u.setDateInscription(new Date());
                    String docUrl = sauvegarderFichierFictif("enseignants", "Diplome_" + p[1].replace(" ", "_"));
                    u.setDocument(docUrl);
                    userRepository.save(u);
                }
            }

            // 4. Publications pour certains utilisateurs
            User alice = userRepository.findByEmail("etudiant1@demo.com").orElse(null);
            User bob = userRepository.findByEmail("etudiant2@demo.com").orElse(null);
            User prof1 = userRepository.findByEmail("prof1@demo.com").orElse(null);
            if (alice != null) {
                Publication p = new Publication();
                p.setUtilisateur(alice);
                p.setContenu("Mon projet de fin d'année sur l'IA générative. Avis bienvenus !");
                p.setStatut(Publication.StatutPublication.VALIDE);
                p.setDatePublication(new Date());
                publicationRepository.save(p);
            }
            if (bob != null) {
                Publication p = new Publication();
                p.setUtilisateur(bob);
                p.setContenu("Recherche ressources sur les équations différentielles stochastiques.");
                p.setStatut(Publication.StatutPublication.VALIDE);
                p.setDatePublication(new Date());
                publicationRepository.save(p);
            }
            if (prof1 != null) {
                Publication p = new Publication();
                p.setUtilisateur(prof1);
                p.setContenu("Offre de stage en physique quantique – été 2026. MP pour détails.");
                p.setStatut(Publication.StatutPublication.VALIDE);
                p.setDatePublication(new Date());
                publicationRepository.save(p);
            }

            // 5. Signalement (depuis l'admin sur une publication de Bob)
            User admin = userRepository.findByEmail("admin@demo.com").orElse(null);
            Publication pubBob = publicationRepository.findAll().stream()
                    .filter(p -> p.getUtilisateur() != null && "etudiant2@demo.com".equals(p.getUtilisateur().getEmail()))
                    .findFirst().orElse(null);
            if (admin != null && pubBob != null) {
                Signalement sig = new Signalement();
                sig.setPublication(pubBob);
                sig.setSignaleur(admin);
                sig.setRaison("Spam – message hors sujet");
                sig.setStatut(Signalement.StatutSignalement.EN_ATTENTE);
                sig.setDateSignalement(new Date());
                signalementRepository.save(sig);
            }

            // 6. Notification pour l'admin
            if (admin != null) {
                Notification notif = new Notification();
                notif.setUtilisateur(admin);
                notif.setMessage("📢 Nouveau signalement sur une publication de Bob Durand");
                notif.setStatut(Notification.StatutNotification.NON_LU);
                notif.setDateNotification(new Date());
                notificationRepository.save(notif);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Jeu de données de démonstration créé avec succès",
                    "status", "OK"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}