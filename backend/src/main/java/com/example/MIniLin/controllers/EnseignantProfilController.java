package com.example.MIniLin.controllers;

import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.*;
import com.example.MIniLin.dtos.ProfilUpdateRequest;
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
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/enseignant")
@CrossOrigin(origins = "http://localhost:5174")
public class EnseignantProfilController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private CompetenceRepository competenceRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private ConnexionRepository connexionRepository;

    @Autowired
    private VerificationDiplomeRepository diplomeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:uploads/profil}")
    private String uploadDir;

    private User getCurrentUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    @GetMapping("/profil/me")
    public ResponseEntity<?> getMonProfil(Principal principal) {
        User user = getCurrentUser(principal);
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("nomComplet", user.getNomComplet());
        response.put("role", user.getRole());
        response.put("photo", user.getPhoto());
        response.put("document", user.getDocument());
        response.put("labo", user.getLabo());
        response.put("depart", user.getDepart());
        response.put("filiere", user.getFiliere());
        response.put("bio", user.getBio());
        response.put("dateInscription", user.getDateInscription());

        // Statistiques
        response.put("nbPublications", publicationRepository.findByUtilisateurOrderByDatePublicationDesc(user).size());
        response.put("nbConnexions", connexionRepository.findAcceptedConnexions(user.getId()).size());
        response.put("nbDiplomes", diplomeRepository.findByEnseignantId(user.getId()).size());

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/profil/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProfil(@ModelAttribute ProfilUpdateRequest request, Principal principal) {
        User user = getCurrentUser(principal);
        if (request.getNomComplet() != null) user.setNomComplet(request.getNomComplet());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getLabo() != null) user.setLabo(request.getLabo());
        if (request.getDepart() != null) user.setDepart(request.getDepart());
        if (request.getFiliere() != null) user.setFiliere(request.getFiliere());

        try {
            if (request.getPhotoFile() != null && !request.getPhotoFile().isEmpty()) {
                user.setPhoto(sauvegarderFichier(request.getPhotoFile(), "photos"));
            }
            if (request.getDocumentFile() != null && !request.getDocumentFile().isEmpty()) {
                user.setDocument(sauvegarderFichier(request.getDocumentFile(), "documents"));
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur upload");
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    private String sauvegarderFichier(MultipartFile file, String subDir) throws IOException {
        Path uploadPath = Paths.get(uploadDir, subDir);
        if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);
        return "/uploads/profil/" + subDir + "/" + fileName;
    }

    // --- EXPÉRIENCES ---
    @GetMapping("/experiences")
    public List<Experience> getExperiences(Principal principal) {
        return experienceRepository.findByUtilisateur(getCurrentUser(principal));
    }

    @PostMapping("/experiences")
    public Experience addExperience(@RequestBody Experience experience, Principal principal) {
        experience.setUtilisateur(getCurrentUser(principal));
        return experienceRepository.save(experience);
    }

    @PutMapping("/experiences/{id}")
    public Experience updateExperience(@PathVariable Long id, @RequestBody Experience details, Principal principal) {
        Experience exp = experienceRepository.findById(id).orElseThrow();
        if (!exp.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        exp.setPoste(details.getPoste());
        exp.setEntreprise(details.getEntreprise());
        exp.setDateDebut(details.getDateDebut());
        exp.setDateFin(details.getDateFin());
        exp.setDescription(details.getDescription());
        exp.setActuel(details.isActuel());
        return experienceRepository.save(exp);
    }

    @DeleteMapping("/experiences/{id}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long id, Principal principal) {
        Experience exp = experienceRepository.findById(id).orElseThrow();
        if (!exp.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        experienceRepository.delete(exp);
        return ResponseEntity.ok().build();
    }

    // --- FORMATIONS ---
    @GetMapping("/formations")
    public List<Formation> getFormations(Principal principal) {
        return formationRepository.findByUtilisateur(getCurrentUser(principal));
    }

    @PostMapping("/formations")
    public Formation addFormation(@RequestBody Formation formation, Principal principal) {
        formation.setUtilisateur(getCurrentUser(principal));
        return formationRepository.save(formation);
    }

    @PutMapping("/formations/{id}")
    public Formation updateFormation(@PathVariable Long id, @RequestBody Formation details, Principal principal) {
        Formation f = formationRepository.findById(id).orElseThrow();
        if (!f.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        f.setEtablissement(details.getEtablissement());
        f.setDiplome(details.getDiplome());
        f.setDateDebut(details.getDateDebut());
        f.setDateFin(details.getDateFin());
        return formationRepository.save(f);
    }

    @DeleteMapping("/formations/{id}")
    public ResponseEntity<?> deleteFormation(@PathVariable Long id, Principal principal) {
        Formation f = formationRepository.findById(id).orElseThrow();
        if (!f.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        formationRepository.delete(f);
        return ResponseEntity.ok().build();
    }

    // --- COMPÉTENCES ---
    @GetMapping("/competences")
    public List<Competence> getCompetences(Principal principal) {
        return competenceRepository.findByUtilisateur(getCurrentUser(principal));
    }

    @PostMapping("/competences")
    public Competence addCompetence(@RequestBody Competence competence, Principal principal) {
        competence.setUtilisateur(getCurrentUser(principal));
        return competenceRepository.save(competence);
    }

    @PutMapping("/competences/{id}")
    public Competence updateCompetence(@PathVariable Long id, @RequestBody Competence details, Principal principal) {
        Competence c = competenceRepository.findById(id).orElseThrow();
        if (!c.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        c.setNom(details.getNom());
        c.setNiveau(details.getNiveau());
        return competenceRepository.save(c);
    }

    @DeleteMapping("/competences/{id}")
    public ResponseEntity<?> deleteCompetence(@PathVariable Long id, Principal principal) {
        Competence c = competenceRepository.findById(id).orElseThrow();
        if (!c.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) throw new RuntimeException("Interdit");
        competenceRepository.delete(c);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> request, Principal principal) {
        User user = getCurrentUser(principal);
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (!passwordEncoder.matches(oldPassword, user.getMotDePasse())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ancien mot de passe incorrect");
        }

        user.setMotDePasse(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok("Mot de passe mis a jour");
    }
}
