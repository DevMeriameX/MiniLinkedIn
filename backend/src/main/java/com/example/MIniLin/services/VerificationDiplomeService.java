package com.example.MIniLin.services;

import com.example.MIniLin.dtos.SoumettreDiplomeRequest;
import com.example.MIniLin.dtos.TraiterVerificationRequest;
import com.example.MIniLin.dtos.VerificationDiplomeDTO;
import com.example.MIniLin.models.*;
import com.example.MIniLin.repositories.UserRepository;
import com.example.MIniLin.repositories.VerificationDiplomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VerificationDiplomeService {

    @Autowired
    private VerificationDiplomeRepository verificationRepository;

    @Autowired
    private UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/diplomes/";

    // Enseignant soumet son diplôme
    public VerificationDiplome soumettreDiplome(Long enseignantId, SoumettreDiplomeRequest request) {
        User enseignant = userRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        // Sauvegarder le fichier
        String fileName = sauvegarderFichier(request.getDocument());

        VerificationDiplome verification = new VerificationDiplome();
        verification.setEnseignant(enseignant);
        verification.setDocumentUrl(fileName);
        verification.setDocumentNom(request.getDocument().getOriginalFilename());
        verification.setTypeDocument(request.getTypeDocument());
        verification.setEtablissement(request.getEtablissement());
        verification.setDiplomeNom(request.getDiplomeNom());
        verification.setAnneeObtention(request.getAnneeObtention());
        verification.setNumeroDiplome(request.getNumeroDiplome());
        verification.setStatut(StatutVerification.EN_ATTENTE);
        verification.setDateSoumission(new Date());

        return verificationRepository.save(verification);
    }

    // Admin voit tous les documents en attente
    public List<VerificationDiplomeDTO> getDocumentsEnAttente() {
        List<VerificationDiplome> documents = verificationRepository.findDocumentsEnAttente();
        return documents.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Admin voit tous les documents d'un enseignant
    public List<VerificationDiplomeDTO> getDocumentsByEnseignant(Long enseignantId) {
        List<VerificationDiplome> documents = verificationRepository.findByEnseignantId(enseignantId);
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Admin approuve le diplôme
    public VerificationDiplome approuverDiplome(TraiterVerificationRequest request) {
        VerificationDiplome verification = verificationRepository.findById(request.getVerificationId())
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        verification.setStatut(StatutVerification.VERIFIE);
        verification.setDateVerification(new Date());
        verification.setCommentaireAdmin(request.getCommentaire());
        verification.setVerificationManuelle(true);
        verification.setMethodeVerification(request.getMethodeVerification());
        verification.setContactVerification(request.getContactVerification());
        verification.setNotesVerification(request.getNotesVerification());

        return verificationRepository.save(verification);
    }

    // Admin rejette le diplôme
    public VerificationDiplome rejeterDiplome(TraiterVerificationRequest request) {
        VerificationDiplome verification = verificationRepository.findById(request.getVerificationId())
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        verification.setStatut(StatutVerification.REJETE);
        verification.setDateVerification(new Date());
        verification.setCommentaireAdmin(request.getCommentaire());
        verification.setVerificationManuelle(true);

        return verificationRepository.save(verification);
    }

    // Obtenir les statistiques
    public long getNombreEnAttente() {
        return verificationRepository.countByStatut(StatutVerification.EN_ATTENTE);
    }

    public long getNombreVerifies() {
        return verificationRepository.countByStatut(StatutVerification.VERIFIE);
    }

    public long getNombreRejetes() {
        return verificationRepository.countByStatut(StatutVerification.REJETE);
    }

    // Enseignant soumet une nouvelle version d'un diplôme rejeté ou le modifie
    public VerificationDiplome soumettreNouvelleVersion(Long diplomeId, Long enseignantId, MultipartFile nouveauFichier) {
        return soumettreNouvelleVersion(diplomeId, enseignantId, nouveauFichier, new SoumettreDiplomeRequest());
    }

    public VerificationDiplome soumettreNouvelleVersion(Long diplomeId, Long enseignantId, MultipartFile nouveauFichier, SoumettreDiplomeRequest req) {
        VerificationDiplome verification = verificationRepository.findById(diplomeId)
                .orElseThrow(() -> new RuntimeException("Diplôme non trouvé"));

        if (!verification.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Accès non autorisé à ce diplôme");
        }

        if (nouveauFichier != null && !nouveauFichier.isEmpty()) {
            String fileName = sauvegarderFichier(nouveauFichier);
            verification.setDocumentUrl(fileName);
            verification.setDocumentNom(nouveauFichier.getOriginalFilename());
        }
        
        if (req.getTypeDocument() != null) verification.setTypeDocument(req.getTypeDocument());
        if (req.getEtablissement() != null) verification.setEtablissement(req.getEtablissement());
        if (req.getDiplomeNom() != null) verification.setDiplomeNom(req.getDiplomeNom());
        if (req.getAnneeObtention() != null) verification.setAnneeObtention(req.getAnneeObtention());
        if (req.getNumeroDiplome() != null) verification.setNumeroDiplome(req.getNumeroDiplome());

        verification.setStatut(StatutVerification.EN_ATTENTE);
        verification.setDateSoumission(new Date());
        verification.setCommentaireAdmin(null); // On efface le commentaire de rejet précédent

        return verificationRepository.save(verification);
    }

    // ========== NOUVELLES MÉTHODES AJOUTÉES ==========

    // Archiver un diplôme
    public void archiverDiplome(Long diplomeId, Long enseignantId) {
        VerificationDiplome verification = verificationRepository.findById(diplomeId)
                .orElseThrow(() -> new RuntimeException("Diplôme non trouvé"));

        if (!verification.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Accès non autorisé à ce diplôme");
        }

        verification.setActif(false);
        verificationRepository.save(verification);
    }

    // Supprimer un diplôme définitivement (pour étudiant)
    public void supprimerDiplome(Long diplomeId, Long etudiantId) {
        VerificationDiplome verification = verificationRepository.findById(diplomeId)
                .orElseThrow(() -> new RuntimeException("Diplôme non trouvé"));

        if (!verification.getEnseignant().getId().equals(etudiantId)) {
            throw new RuntimeException("Accès non autorisé à ce diplôme");
        }

        verificationRepository.delete(verification);
    }

    // Réactiver un diplôme
    public void reactiverDiplome(Long diplomeId, Long enseignantId) {
        VerificationDiplome verification = verificationRepository.findById(diplomeId)
                .orElseThrow(() -> new RuntimeException("Diplôme non trouvé"));

        if (!verification.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Accès non autorisé à ce diplôme");
        }

        verification.setActif(true);
        verificationRepository.save(verification);
    }

    // Obtenir un document par son ID
    public VerificationDiplomeDTO getDocumentById(Long verificationId) {
        VerificationDiplome verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Document non trouvé avec ID: " + verificationId));
        return convertToDTO(verification);
    }

    // Sauvegarder le fichier
    private String sauvegarderFichier(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Dossier créé: " + uploadPath.toAbsolutePath().toString());
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "/uploads/diplomes/" + fileName;
            System.out.println("✅ Fichier uploadé avec succès!");
            System.out.println("   Nom: " + fileName);
            System.out.println("   Chemin: " + filePath.toAbsolutePath().toString());
            System.out.println("   URL: " + fileUrl);

            return fileUrl;

        } catch (IOException e) {
            System.err.println("❌ Erreur lors de la sauvegarde: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier: " + e.getMessage());
        }
    }

    // Convertir en DTO
    private VerificationDiplomeDTO convertToDTO(VerificationDiplome v) {
        VerificationDiplomeDTO dto = new VerificationDiplomeDTO();
        dto.setId(v.getId());
        dto.setEnseignantNom(v.getEnseignant().getNomComplet());
        dto.setEnseignantEmail(v.getEnseignant().getEmail());
        dto.setDocumentNom(v.getDocumentNom());
        dto.setDocumentUrl(v.getDocumentUrl());
        dto.setTypeDocument(v.getTypeDocument());
        dto.setDateSoumission(v.getDateSoumission());
        dto.setStatut(v.getStatut());
        dto.setCommentaireAdmin(v.getCommentaireAdmin());
        dto.setEtablissement(v.getEtablissement());
        dto.setDiplomeNom(v.getDiplomeNom());
        dto.setAnneeObtention(v.getAnneeObtention());
        dto.setNumeroDiplome(v.getNumeroDiplome());
        dto.setActif(v.isActif());
        return dto;
    }

    // ========== MÉTHODE POUR LISTER TOUS LES FICHIERS UPLOADÉS (DEBUG) ==========

    public ResponseEntity<?> listAllUploadedFiles() {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                return ResponseEntity.ok(Map.of(
                        "message", "Le dossier d'upload n'existe pas encore",
                        "path", uploadPath.toAbsolutePath().toString(),
                        "files", List.of()
                ));
            }

            List<Map<String, String>> files = Files.list(uploadPath)
                    .filter(Files::isRegularFile)
                    .map(path -> {
                        Map<String, String> fileInfo = new HashMap<>();
                        fileInfo.put("name", path.getFileName().toString());
                        fileInfo.put("path", path.toString());
                        fileInfo.put("url", "http://localhost:8080/uploads/diplomes/" + path.getFileName().toString());
                        try {
                            long size = Files.size(path);
                            fileInfo.put("size", formatFileSize(size));
                        } catch (IOException e) {
                            fileInfo.put("size", "unknown");
                        }
                        return fileInfo;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("uploadDirectory", uploadPath.toAbsolutePath().toString());
            response.put("totalFiles", files.size());
            response.put("files", files);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String formatFileSize(long size) {
        if (size < 1024) return size + " B";
        int z = (63 - Long.numberOfLeadingZeros(size)) / 10;
        return String.format("%.1f %sB", (double) size / (1L << (z * 10)), " KMGTPE".charAt(z));
    }
}