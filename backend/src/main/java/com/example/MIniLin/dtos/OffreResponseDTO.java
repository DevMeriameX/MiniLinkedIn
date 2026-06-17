package com.example.MIniLin.dtos;

import java.time.LocalDate;

public class OffreResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private String type;
    private LocalDate datePublication;
    private String statut;
    private int nbCandidatures;
    private String auteurNom;
    private Long auteurId;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDate getDatePublication() { return datePublication; }
    public void setDatePublication(LocalDate datePublication) { this.datePublication = datePublication; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public int getNbCandidatures() { return nbCandidatures; }
    public void setNbCandidatures(int nbCandidatures) { this.nbCandidatures = nbCandidatures; }

    public String getAuteurNom() { return auteurNom; }
    public void setAuteurNom(String auteurNom) { this.auteurNom = auteurNom; }

    public Long getAuteurId() { return auteurId; }
    public void setAuteurId(Long auteurId) { this.auteurId = auteurId; }
}
