package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.SoumettreDiplomeRequest;
import com.example.MIniLin.dtos.TraiterVerificationRequest;
import com.example.MIniLin.dtos.VerificationDiplomeDTO;
import com.example.MIniLin.models.TypeDocument;
import com.example.MIniLin.models.VerificationDiplome;
import com.example.MIniLin.services.VerificationDiplomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class VerificationDiplomeController {

  @Autowired
  private VerificationDiplomeService verificationService;

  // ========== ENDPOINTS POUR ENSEIGNANT ==========

  @PostMapping("/enseignant/diplome/soumettre")
  public ResponseEntity<?> soumettreDiplomeEnseignant(
      @RequestParam Long enseignantId,
      @RequestParam TypeDocument typeDocument,
      @RequestParam String etablissement,
      @RequestParam String diplomeNom,
      @RequestParam String anneeObtention,
      @RequestParam String numeroDiplome,
      @RequestParam("document") MultipartFile document) {
    try {
      SoumettreDiplomeRequest request = new SoumettreDiplomeRequest();
      request.setTypeDocument(typeDocument);
      request.setEtablissement(etablissement);
      request.setDiplomeNom(diplomeNom);
      request.setAnneeObtention(anneeObtention);
      request.setNumeroDiplome(numeroDiplome);
      request.setDocument(document);

      VerificationDiplome result = verificationService.soumettreDiplome(enseignantId, request);

      // Retourner une réponse détaillée avec l'URL du fichier
      Map<String, Object> response = new HashMap<>();
      response.put("id", result.getId());
      response.put("message", "Diplôme soumis avec succès");
      response.put("diplomeNom", result.getDiplomeNom());
      response.put("etablissement", result.getEtablissement());
      response.put("statut", result.getStatut());
      response.put("documentUrl", result.getDocumentUrl());
      response.put("documentNom", result.getDocumentNom());
      response.put("fullDocumentUrl", "http://localhost:8080" + result.getDocumentUrl());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @GetMapping("/enseignant/{enseignantId}/diplomes")
  public ResponseEntity<?> getMesDiplomesEnseignant(@PathVariable Long enseignantId) {
    List<VerificationDiplomeDTO> diplomes = verificationService.getDocumentsByEnseignant(enseignantId);

    // Ajouter l'URL complète pour chaque document
    List<Map<String, Object>> result = diplomes.stream().map(d -> {
      Map<String, Object> item = new HashMap<>();
      item.put("id", d.getId());
      item.put("diplomeNom", d.getDiplomeNom());
      item.put("etablissement", d.getEtablissement());
      item.put("anneeObtention", d.getAnneeObtention());
      item.put("typeDocument", d.getTypeDocument());
      item.put("statut", d.getStatut());
      item.put("actif", d.isActif());
      item.put("dateSoumission", d.getDateSoumission());
      item.put("numeroDiplome", d.getNumeroDiplome());
      item.put("documentUrl", d.getDocumentUrl());
      item.put("documentNom", d.getDocumentNom());
      item.put("fullDocumentUrl", "http://localhost:8080" + d.getDocumentUrl());
      item.put("commentaireAdmin", d.getCommentaireAdmin());
      return item;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(result);
  }

  @PostMapping("/enseignant/diplome/{id}/resoumettre")
  public ResponseEntity<?> resoumettreDiplomeEnseignant(
      @PathVariable Long id,
      @RequestParam Long enseignantId,
      @RequestParam(value = "document", required = false) MultipartFile document,
      @RequestParam(required = false) TypeDocument typeDocument,
      @RequestParam(required = false) String etablissement,
      @RequestParam(required = false) String diplomeNom,
      @RequestParam(required = false) String anneeObtention,
      @RequestParam(required = false) String numeroDiplome) {
    try {
      SoumettreDiplomeRequest req = new SoumettreDiplomeRequest();
      req.setTypeDocument(typeDocument);
      req.setEtablissement(etablissement);
      req.setDiplomeNom(diplomeNom);
      req.setAnneeObtention(anneeObtention);
      req.setNumeroDiplome(numeroDiplome);
      
      VerificationDiplome result = verificationService.soumettreNouvelleVersion(id, enseignantId, document, req);
      return ResponseEntity.ok(Map.of(
          "message", "Document mis à jour avec succès",
          "statut", result.getStatut(),
          "documentUrl", result.getDocumentUrl()));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @DeleteMapping("/enseignant/diplome/{id}")
  public ResponseEntity<?> archiverDiplomeEnseignant(@PathVariable Long id, @RequestParam Long enseignantId) {
    try {
      verificationService.archiverDiplome(id, enseignantId);
      return ResponseEntity.ok(Map.of("message", "Diplôme archivé avec succès"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @PatchMapping("/enseignant/diplome/{id}/reactiver")
  public ResponseEntity<?> reactiverDiplomeEnseignant(@PathVariable Long id, @RequestParam Long enseignantId) {
    try {
      verificationService.reactiverDiplome(id, enseignantId);
      return ResponseEntity.ok(Map.of("message", "Diplôme réactivé avec succès"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  // ========== ENDPOINTS POUR ETUDIANT ==========

  @PostMapping("/etudiant/diplome/soumettre")
  public ResponseEntity<?> soumettreDiplomeEtudiant(
      @RequestParam Long etudiantId,
      @RequestParam TypeDocument typeDocument,
      @RequestParam String etablissement,
      @RequestParam String diplomeNom,
      @RequestParam String anneeObtention,
      @RequestParam String numeroDiplome,
      @RequestParam("document") MultipartFile document) {
    try {
      SoumettreDiplomeRequest request = new SoumettreDiplomeRequest();
      request.setTypeDocument(typeDocument);
      request.setEtablissement(etablissement);
      request.setDiplomeNom(diplomeNom);
      request.setAnneeObtention(anneeObtention);
      request.setNumeroDiplome(numeroDiplome);
      request.setDocument(document);

      VerificationDiplome result = verificationService.soumettreDiplome(etudiantId, request);

      Map<String, Object> response = new HashMap<>();
      response.put("id", result.getId());
      response.put("message", "Diplôme soumis avec succès");
      response.put("diplomeNom", result.getDiplomeNom());
      response.put("etablissement", result.getEtablissement());
      response.put("statut", result.getStatut());
      response.put("documentUrl", result.getDocumentUrl());
      response.put("documentNom", result.getDocumentNom());
      response.put("fullDocumentUrl", "http://localhost:8080" + result.getDocumentUrl());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @GetMapping("/etudiant/{etudiantId}/diplomes")
  public ResponseEntity<?> getMesDiplomesEtudiant(@PathVariable Long etudiantId) {
    List<VerificationDiplomeDTO> diplomes = verificationService.getDocumentsByEnseignant(etudiantId);

    List<Map<String, Object>> result = diplomes.stream().map(d -> {
      Map<String, Object> item = new HashMap<>();
      item.put("id", d.getId());
      item.put("diplomeNom", d.getDiplomeNom());
      item.put("etablissement", d.getEtablissement());
      item.put("anneeObtention", d.getAnneeObtention());
      item.put("typeDocument", d.getTypeDocument());
      item.put("statut", d.getStatut());
      item.put("dateSoumission", d.getDateSoumission());
      item.put("documentUrl", d.getDocumentUrl());
      item.put("documentNom", d.getDocumentNom());
      item.put("fullDocumentUrl", "http://localhost:8080" + d.getDocumentUrl());
      item.put("commentaireAdmin", d.getCommentaireAdmin());
      return item;
    }).collect(Collectors.toList());

    return ResponseEntity.ok(result);
  }

  @PostMapping("/etudiant/diplome/{id}/resoumettre")
  public ResponseEntity<?> resoumettreDiplomeEtudiant(
      @PathVariable Long id,
      @RequestParam Long etudiantId,
      @RequestParam("document") MultipartFile document) {
    try {
      VerificationDiplome result = verificationService.soumettreNouvelleVersion(id, etudiantId, document);
      return ResponseEntity.ok(Map.of(
          "message", "Nouvelle version soumise avec succès",
          "statut", result.getStatut(),
          "documentUrl", result.getDocumentUrl()));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @DeleteMapping("/etudiant/diplome/{id}")
  public ResponseEntity<?> supprimerDiplomeEtudiant(@PathVariable Long id, @RequestParam Long etudiantId) {
    try {
      verificationService.supprimerDiplome(id, etudiantId);
      return ResponseEntity.ok(Map.of("message", "Diplôme supprimé avec succès"));
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  // ========== ENDPOINTS POUR ADMIN ==========

  @GetMapping("/admin/diplomes/en-attente")
  public ResponseEntity<?> getDocumentsEnAttente() {
    List<VerificationDiplomeDTO> diplomes = verificationService.getDocumentsEnAttente();

    // Ajouter l'URL complète pour chaque document
    List<Map<String, Object>> result = diplomes.stream().map(d -> {
      Map<String, Object> item = new HashMap<>();
      item.put("id", d.getId());
      item.put("enseignantNom", d.getEnseignantNom());
      item.put("enseignantEmail", d.getEnseignantEmail());
      item.put("diplomeNom", d.getDiplomeNom());
      item.put("etablissement", d.getEtablissement());
      item.put("anneeObtention", d.getAnneeObtention());
      item.put("typeDocument", d.getTypeDocument());
      item.put("statut", d.getStatut());
      item.put("dateSoumission", d.getDateSoumission());
      item.put("documentUrl", d.getDocumentUrl());
      item.put("documentNom", d.getDocumentNom());
      item.put("fullDocumentUrl", "http://localhost:8080" + d.getDocumentUrl());
      return item;
    }).collect(Collectors.toList());

    Map<String, Object> response = new HashMap<>();
    response.put("count", result.size());
    response.put("documents", result);

    return ResponseEntity.ok(response);
  }

  @PutMapping("/admin/diplome/approuver")
  public ResponseEntity<?> approuverDiplome(@RequestBody TraiterVerificationRequest request) {
    try {
      VerificationDiplome result = verificationService.approuverDiplome(request);

      Map<String, Object> response = new HashMap<>();
      response.put("id", result.getId());
      response.put("message", "Diplôme approuvé avec succès");
      response.put("statut", result.getStatut());
      response.put("commentaire", result.getCommentaireAdmin());
      response.put("diplomeNom", result.getDiplomeNom());
      response.put("enseignant", result.getEnseignant().getNomComplet());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @PutMapping("/admin/diplome/rejeter")
  public ResponseEntity<?> rejeterDiplome(@RequestBody TraiterVerificationRequest request) {
    try {
      VerificationDiplome result = verificationService.rejeterDiplome(request);

      Map<String, Object> response = new HashMap<>();
      response.put("id", result.getId());
      response.put("message", "Diplôme rejeté");
      response.put("statut", result.getStatut());
      response.put("commentaire", result.getCommentaireAdmin());
      response.put("diplomeNom", result.getDiplomeNom());

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  @GetMapping("/admin/diplomes/statistiques")
  public ResponseEntity<?> getStatistiques() {
    Map<String, Object> stats = new HashMap<>();
    stats.put("enAttente", verificationService.getNombreEnAttente());
    stats.put("verifies", verificationService.getNombreVerifies());
    stats.put("rejetes", verificationService.getNombreRejetes());
    stats.put("total", verificationService.getNombreEnAttente() +
        verificationService.getNombreVerifies() +
        verificationService.getNombreRejetes());

    return ResponseEntity.ok(stats);
  }

  // ========== NOUVEAUX ENDPOINTS POUR VOIR/TÉLÉCHARGER LES FICHIERS ==========

  // Télécharger le document d'un diplôme spécifique
  @GetMapping("/admin/diplome/{verificationId}/download")
  public ResponseEntity<?> downloadDocument(@PathVariable Long verificationId) {
    try {
      VerificationDiplomeDTO diplome = verificationService.getDocumentById(verificationId);
      String documentUrl = diplome.getDocumentUrl();

      // Extraire le chemin du fichier (supprimer /uploads/...)
      String filePath = documentUrl.replace("/uploads/", "");
      Path path = Paths.get("uploads/" + filePath);

      Resource resource = new UrlResource(path.toUri());

      if (resource.exists() && resource.isReadable()) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + diplome.getDocumentNom() + "\"")
            .body(resource);
      } else {
        return ResponseEntity.badRequest().body("Fichier non trouvé");
      }
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  // Obtenir les détails d'un diplôme avec l'URL du fichier
  @GetMapping("/admin/diplome/{verificationId}/details")
  public ResponseEntity<?> getDiplomeDetails(@PathVariable Long verificationId) {
    try {
      VerificationDiplomeDTO diplome = verificationService.getDocumentById(verificationId);

      Map<String, Object> details = new HashMap<>();
      details.put("id", diplome.getId());
      details.put("enseignantNom", diplome.getEnseignantNom());
      details.put("enseignantEmail", diplome.getEnseignantEmail());
      details.put("diplomeNom", diplome.getDiplomeNom());
      details.put("etablissement", diplome.getEtablissement());
      details.put("anneeObtention", diplome.getAnneeObtention());
      details.put("numeroDiplome", diplome.getNumeroDiplome());
      details.put("typeDocument", diplome.getTypeDocument());
      details.put("statut", diplome.getStatut());
      details.put("dateSoumission", diplome.getDateSoumission());
      details.put("documentUrl", diplome.getDocumentUrl());
      details.put("documentNom", diplome.getDocumentNom());
      details.put("fullDocumentUrl", "http://localhost:8080" + diplome.getDocumentUrl());
      details.put("commentaireAdmin", diplome.getCommentaireAdmin());

      return ResponseEntity.ok(details);
    } catch (Exception e) {
      return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
    }
  }

  // Lister tous les fichiers uploadés (pour debug)
  @GetMapping("/admin/uploads/list")
  public ResponseEntity<?> listUploadedFiles() {
    return verificationService.listAllUploadedFiles();
  }
}