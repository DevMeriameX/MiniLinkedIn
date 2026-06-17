package com.example.MIniLin.services;

import com.example.MIniLin.dtos.OffreRequestDTO;
import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.models.Offre;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.OffreRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OffreService {

    @Autowired
    private OffreRepository offreRepository;

    @Autowired
    private UserRepository userRepository;

    public List<OffreResponseDTO> getOffresForEnseignant(Long enseignantId, String statut, List<String> types) {
        // Si types est vide, on le passe comme null pour la requête JPQL
        List<String> typesParam = (types != null && !types.isEmpty()) ? types : null;
        String statutParam = (statut != null && !statut.isBlank()) ? statut : null;

        return offreRepository.filterOffres(enseignantId, statutParam, typesParam)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OffreResponseDTO creerOffre(Long enseignantId, OffreRequestDTO dto) {
        User enseignant = userRepository.findById(enseignantId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Offre offre = new Offre();
        offre.setTitre(dto.getTitre());
        offre.setDescription(dto.getDescription());
        offre.setType(dto.getType());
        offre.setNbCandidatures(dto.getNbCandidatures());
        offre.setEnseignant(enseignant);
        
        return convertToDTO(offreRepository.save(offre));
    }

        public List<OffreResponseDTO> getAllActiveOffres() {
        return offreRepository.findByStatutOrderByDatePublicationDesc("active")
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OffreResponseDTO modifierOffre(Long enseignantId, Long offreId, OffreRequestDTO dto) {
        Offre offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
        
        if (!offre.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette offre");
        }
        
        offre.setTitre(dto.getTitre());
        offre.setDescription(dto.getDescription());
        offre.setType(dto.getType());
        offre.setNbCandidatures(dto.getNbCandidatures());
        
        return convertToDTO(offreRepository.save(offre));
    }

    @Transactional
    public void supprimerOffre(Long enseignantId, Long offreId) {
        Offre offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
        
        if (!offre.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette offre");
        }
        
        offreRepository.delete(offre);
    }

    @Transactional
    public OffreResponseDTO changerStatut(Long enseignantId, Long offreId, String nouveauStatut) {
        Offre offre = offreRepository.findById(offreId)
                .orElseThrow(() -> new RuntimeException("Offre non trouvée"));
        
        if (!offre.getEnseignant().getId().equals(enseignantId)) {
            throw new RuntimeException("Action non autorisée");
        }
        
        offre.setStatut(nouveauStatut);
        return convertToDTO(offreRepository.save(offre));
    }

    private OffreResponseDTO convertToDTO(Offre offre) {
        OffreResponseDTO dto = new OffreResponseDTO();
        dto.setId(offre.getId());
        dto.setTitre(offre.getTitre());
        dto.setDescription(offre.getDescription());
        dto.setType(offre.getType());
        dto.setDatePublication(offre.getDatePublication());
        dto.setStatut(offre.getStatut());
        dto.setNbCandidatures(offre.getNbCandidatures());
        dto.setAuteurNom(offre.getEnseignant().getNomComplet());
        dto.setAuteurId(offre.getEnseignant().getId());
        return dto;
    }
}
