package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.ProfilUpdateRequest;
import com.example.MIniLin.models.Competence;
import com.example.MIniLin.models.Experience;
import com.example.MIniLin.models.Formation;
import com.example.MIniLin.models.StatutVerification;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.CompetenceRepository;
import com.example.MIniLin.repositories.ConnexionRepository;
import com.example.MIniLin.repositories.ExperienceRepository;
import com.example.MIniLin.repositories.FormationRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.repositories.VerificationDiplomeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/etudiant")
@CrossOrigin(origins = "http://localhost:5174")
public class EtudiantProfilController {

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
        .orElseThrow(() -> new RuntimeException("Utilisateur non trouve"));
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
    response.put("filiere", user.getFiliere());
    response.put("niveauEtudes", user.getNiveauEtudes());
    response.put("statutAcademique", user.getStatutAcademique());
    response.put("bio", user.getBio());
    response.put("dateInscription", user.getDateInscription());
    response.put("nbPublications", publicationRepository.findByUtilisateurOrderByDatePublicationDesc(user).size());
    response.put("nbConnexions", connexionRepository.findAcceptedConnexions(user.getId()).size());
    response.put("nbDiplomes",
        diplomeRepository.countByEnseignantIdAndStatut(user.getId(), StatutVerification.VERIFIE));
    return ResponseEntity.ok(response);
  }

  @GetMapping("/enseignants/{enseignantId}/profil")
  public ResponseEntity<?> getEnseignantProfil(@PathVariable Long enseignantId, Principal principal) {
    User etudiant = getCurrentUser(principal);
    User enseignant = userRepository.findById(enseignantId)
        .orElseThrow(() -> new RuntimeException("Enseignant non trouve"));

    Map<String, Object> response = new HashMap<>();
    response.put("id", enseignant.getId());
    response.put("nomComplet", enseignant.getNomComplet());
    response.put("email", enseignant.getEmail());
    response.put("photo", enseignant.getPhoto());
    response.put("bio", enseignant.getBio());
    response.put("depart", enseignant.getDepart());
    response.put("labo", enseignant.getLabo());
    response.put("role", enseignant.getRole());
    response.put("experiences", experienceRepository.findByUtilisateur(enseignant));
    response.put("formations", formationRepository.findByUtilisateur(enseignant));
    response.put("competences", competenceRepository.findByUtilisateur(enseignant));

    boolean isConnected = connexionRepository.findExistingConnexion(etudiant.getId(), enseignant.getId())
        .map(c -> c.getStatut() == com.example.MIniLin.models.StatutConnexion.ACCEPTEE)
        .orElse(false);
    response.put("isConnected", isConnected);

    return ResponseEntity.ok(response);
  }

  @GetMapping("/etudiants/{etudiantId}/profil")
  public ResponseEntity<?> getEtudiantProfil(@PathVariable Long etudiantId, Principal principal) {
    User currentEtudiant = getCurrentUser(principal);
    User targetEtudiant = userRepository.findById(etudiantId)
        .orElseThrow(() -> new RuntimeException("Etudiant non trouve"));

    Map<String, Object> response = new HashMap<>();
    response.put("id", targetEtudiant.getId());
    response.put("nomComplet", targetEtudiant.getNomComplet());
    response.put("email", targetEtudiant.getEmail());
    response.put("photo", targetEtudiant.getPhoto());
    response.put("document", targetEtudiant.getDocument());
    response.put("bio", targetEtudiant.getBio());
    response.put("filiere", targetEtudiant.getFiliere());
    response.put("niveauEtudes", targetEtudiant.getNiveauEtudes());
    response.put("statutAcademique", targetEtudiant.getStatutAcademique());
    response.put("experiences", experienceRepository.findByUtilisateur(targetEtudiant));
    response.put("formations", formationRepository.findByUtilisateur(targetEtudiant));
    response.put("competences", competenceRepository.findByUtilisateur(targetEtudiant));

    boolean isConnected = connexionRepository.findExistingConnexion(currentEtudiant.getId(), targetEtudiant.getId())
        .map(c -> c.getStatut() == com.example.MIniLin.models.StatutConnexion.ACCEPTEE)
        .orElse(false);
    response.put("isConnected", isConnected);

    // Publications de l'étudiant cible (EN_ATTENTE and VALIDE)
    List<Map<String, Object>> pubs = publicationRepository
        .findByUtilisateurOrderByDatePublicationDesc(targetEtudiant)
        .stream()
        .filter(p -> p.getStatut() == com.example.MIniLin.models.Publication.StatutPublication.VALIDE || 
                     p.getStatut() == com.example.MIniLin.models.Publication.StatutPublication.EN_ATTENTE)
        .map(p -> {
          Map<String, Object> pm = new HashMap<>();
          pm.put("id", p.getId());
          pm.put("titre", p.getTitre());
          pm.put("resume", p.getResume());
          pm.put("contenu", p.getContenu());
          pm.put("typePublication", p.getTypePublication());
          pm.put("datePublication", p.getDatePublication());
          pm.put("fichierUrl", p.getFichierJointUrl());
          pm.put("statut", p.getStatut());
          return pm;
        }).collect(java.util.stream.Collectors.toList());
    response.put("publications", pubs);

    // Recommandations de l'étudiant cible
    List<Map<String, Object>> recs = new java.util.ArrayList<>();
    response.put("recommandations", recs);

    return ResponseEntity.ok(response);
  }

  @PutMapping(value = "/profil/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> updateProfil(@ModelAttribute ProfilUpdateRequest request, Principal principal) {
    User user = getCurrentUser(principal);
    if (request.getNomComplet() != null)
      user.setNomComplet(request.getNomComplet());
    if (request.getBio() != null)
      user.setBio(request.getBio());
    if (request.getFiliere() != null)
      user.setFiliere(request.getFiliere());
    if (request.getNiveauEtudes() != null)
      user.setNiveauEtudes(request.getNiveauEtudes());
    if (request.getStatutAcademique() != null)
      user.setStatutAcademique(request.getStatutAcademique());

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

  private String sauvegarderFichier(MultipartFile file, String subDir) throws IOException {
    Path uploadPath = Paths.get(uploadDir, subDir);
    if (!Files.exists(uploadPath))
      Files.createDirectories(uploadPath);
    String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
    Path filePath = uploadPath.resolve(fileName);
    Files.copy(file.getInputStream(), filePath);
    return "/uploads/profil/" + subDir + "/" + fileName;
  }

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
    if (!exp.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) {
      throw new RuntimeException("Interdit");
    }
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
    if (!exp.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) {
      throw new RuntimeException("Interdit");
    }
    experienceRepository.delete(exp);
    return ResponseEntity.ok().build();
  }

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
    if (!f.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) {
      throw new RuntimeException("Interdit");
    }
    f.setEtablissement(details.getEtablissement());
    f.setDiplome(details.getDiplome());
    f.setDateDebut(details.getDateDebut());
    f.setDateFin(details.getDateFin());
    return formationRepository.save(f);
  }

  @DeleteMapping("/formations/{id}")
  public ResponseEntity<?> deleteFormation(@PathVariable Long id, Principal principal) {
    Formation f = formationRepository.findById(id).orElseThrow();
    if (!f.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) {
      throw new RuntimeException("Interdit");
    }
    formationRepository.delete(f);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/competences")
  public List<Competence> getCompetences(Principal principal) {
    return competenceRepository.findByUtilisateur(getCurrentUser(principal));
  }

  @PostMapping("/competences")
  public Competence addCompetence(@RequestBody Competence competence, Principal principal) {
    competence.setUtilisateur(getCurrentUser(principal));
    return competenceRepository.save(competence);
  }

  @DeleteMapping("/competences/{id}")
  public ResponseEntity<?> deleteCompetence(@PathVariable Long id, Principal principal) {
    Competence c = competenceRepository.findById(id).orElseThrow();
    if (!c.getUtilisateur().getId().equals(getCurrentUser(principal).getId())) {
      throw new RuntimeException("Interdit");
    }
    competenceRepository.delete(c);
    return ResponseEntity.ok().build();
  }
}
