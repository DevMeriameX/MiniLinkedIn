package com.example.MIniLin.services;

import com.example.MIniLin.dtos.ModifierPublicationRequest;
import com.example.MIniLin.dtos.PublicationRequest;
import com.example.MIniLin.dtos.PublicationResponse;
import com.example.MIniLin.models.Commentaire;
import com.example.MIniLin.models.Publication;
import com.example.MIniLin.models.Reaction;
import com.example.MIniLin.models.User;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.repositories.CommentaireRepository;
import com.example.MIniLin.repositories.PublicationRepository;
import com.example.MIniLin.repositories.ReactionRepository;
import com.example.MIniLin.repositories.SignalementRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicationService {

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentaireRepository commentaireRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Autowired
    private SignalementRepository signalementRepository;

    @Value("${file.upload-dir:uploads/publications}")
    private String uploadDir;

    private static final List<String> IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/jpg", "image/gif");
    private static final List<String> PDF_TYPES = List.of("application/pdf");

    // CORRIGÉ : Utiliser Publication.StatutPublication
    public PublicationResponse creerPublication(Long enseignantId, PublicationRequest request) {
        User enseignant = userRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        User coAuteur = null;
        if (enseignant.getRole() == Role.ETUDIANT && "ARTICLE_RECHERCHE".equalsIgnoreCase(request.getTypePublication())) {
            if (request.getCoAuthorId() == null) {
                throw new RuntimeException("Un étudiant doit spécifier un co-auteur (enseignant/chercheur) pour un article de recherche.");
            }
            coAuteur = userRepository.findById(request.getCoAuthorId())
                    .orElseThrow(() -> new RuntimeException("Co-auteur non trouvé"));
            if (coAuteur.getRole() != Role.ENSEIGNANT && !"CHERCHEUR".equalsIgnoreCase(coAuteur.getStatutAcademique())) {
                throw new RuntimeException("Le co-auteur doit être un enseignant ou chercheur.");
            }
        }

        Publication publication = new Publication();
        publication.setUtilisateur(enseignant);
        publication.setTitre(request.getTitre());
        publication.setResume(request.getResume());
        publication.setContenu(request.getContenu());
        if (request.getTypePublication() != null && !request.getTypePublication().isBlank()) {
            publication.setTypePublication(Publication.TypePublication.valueOf(request.getTypePublication().toUpperCase()));
        }
        publication.setDatePublication(new Date());
        publication.setStatut(Publication.StatutPublication.EN_ATTENTE); // CORRIGÉ
        if (coAuteur != null) {
            publication.setCoAuteur(coAuteur);
        }

        if (request.getFichierJoint() != null && !request.getFichierJoint().isEmpty()) {
            String fichierInfo = sauvegarderFichier(request.getFichierJoint());
            publication.setFichierJointUrl(fichierInfo);
        }

        Publication saved = publicationRepository.save(publication);
        return convertToResponse(saved);
    }

    public PublicationResponse modifierPublication(Long publicationId, Long enseignantId, ModifierPublicationRequest request) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));

        if (!publication.getUtilisateur().getId().equals(enseignantId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette publication");
        }

        // CORRIGÉ
        if (publication.getStatut() == Publication.StatutPublication.VALIDE) {
            throw new RuntimeException("Cette publication est déjà validée et ne peut plus être modifiée");
        }

        publication.setContenu(request.getContenu());
        publication.setTitre(request.getTitre());
        publication.setResume(request.getResume());
        if (request.getTypePublication() != null && !request.getTypePublication().isBlank()) {
            publication.setTypePublication(Publication.TypePublication.valueOf(request.getTypePublication().toUpperCase()));
        }
        publication.setModifie(true);
        publication.setDateModification(new Date());

        // Handle file update
        if (request.getFichierJoint() != null && !request.getFichierJoint().isEmpty()) {
            // Delete old file
            if (publication.getFichierJointUrl() != null && !publication.getFichierJointUrl().isEmpty()) {
                supprimerFichier(publication.getFichierJointUrl());
            }
            // Save new file
            String newFileUrl = sauvegarderFichier(request.getFichierJoint());
            publication.setFichierJointUrl(newFileUrl);
        }

        Publication saved = publicationRepository.save(publication);
        return convertToResponse(saved);
    }

    @Transactional
    public void supprimerPublication(Long publicationId, Long enseignantId) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));

        if (!publication.getUtilisateur().getId().equals(enseignantId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette publication");
        }

        if (publication.getFichierJointUrl() != null && !publication.getFichierJointUrl().isEmpty()) {
            supprimerFichier(publication.getFichierJointUrl());
        }

        // Supprimer les signalements liés à cette publication
        signalementRepository.deleteByPublication(publication);

        List<Commentaire> commentaires = commentaireRepository.findByPublication(publication);
        commentaireRepository.deleteAll(commentaires);

        List<Reaction> reactions = reactionRepository.findByPublication(publication);
        reactionRepository.deleteAll(reactions);

        publicationRepository.delete(publication);
    }

    public List<PublicationResponse> getPublicationsByEnseignant(Long enseignantId) {
        User enseignant = userRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));

        List<Publication> publications = publicationRepository.findByUtilisateurOrderByDatePublicationDesc(enseignant);
        return publications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PublicationResponse getPublicationById(Long publicationId) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new RuntimeException("Publication non trouvée"));
        return convertToResponse(publication);
    }

    private String sauvegarderFichier(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || (!IMAGE_TYPES.contains(contentType) && !PDF_TYPES.contains(contentType))) {
                throw new RuntimeException("Type de fichier non supporté. Utilisez une image (JPG, PNG, GIF) ou un PDF.");
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("Fichier trop volumineux. Taille maximale: 5MB");
            }

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/publications/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la sauvegarde du fichier: " + e.getMessage());
        }
    }

    private void supprimerFichier(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Path filePath = Paths.get(uploadDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Erreur lors de la suppression du fichier: " + e.getMessage());
        }
    }

    private PublicationResponse convertToResponse(Publication publication) {
        PublicationResponse response = new PublicationResponse();
        response.setId(publication.getId());
        response.setTitre(publication.getTitre());
        response.setResume(publication.getResume());
        response.setTypePublication(publication.getTypePublication() != null ? publication.getTypePublication().name() : null);
        response.setContenu(publication.getContenu());
        response.setFichierUrl(publication.getFichierJointUrl());
        response.setFichierNom(extraireNomFichier(publication.getFichierJointUrl()));
        response.setFichierType(determinerTypeFichier(publication.getFichierJointUrl()));
        response.setDatePublication(publication.getDatePublication());
        // CORRIGÉ : récupérer le nom de l'énumération
        response.setStatut(publication.getStatut() != null ? publication.getStatut().name() : "EN_ATTENTE");
        response.setAuteurNom(publication.getUtilisateur().getNomComplet());
        response.setAuteurId(publication.getUtilisateur().getId());
        response.setAuteurRole(publication.getUtilisateur().getRole() != null ? publication.getUtilisateur().getRole().name() : "ETUDIANT");
        response.setMotifRefus(publication.getMotifRefus());
        response.setAuteurPhoto(publication.getUtilisateur().getPhoto());
        
        if (publication.getCoAuteur() != null) {
            response.setCoAuthorId(publication.getCoAuteur().getId());
            response.setCoAuthorNom(publication.getCoAuteur().getNomComplet());
        }

        List<Commentaire> commentaires = commentaireRepository.findByPublication(publication);
        List<Reaction> reactions = reactionRepository.findByPublication(publication);
        response.setNombreCommentaires(commentaires != null ? commentaires.size() : 0);
        response.setNombreReactions(reactions != null ? reactions.size() : 0);

        return response;
    }

    private String extraireNomFichier(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return null;
        return fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    }

    private String determinerTypeFichier(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) return null;
        String fileName = fileUrl.toLowerCase();
        if (fileName.endsWith(".pdf")) return "PDF";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "JPEG";
        if (fileName.endsWith(".png")) return "PNG";
        if (fileName.endsWith(".gif")) return "GIF";
        return "DOCUMENT";
    }
}