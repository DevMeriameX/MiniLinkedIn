package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "offres")
public class Offre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 2000)
    private String description;

    private String type;          // "stage", "projet", "recherche"

    private LocalDate datePublication;

    private String statut;        // "active" ou "archivee"

    private int nbCandidatures;   // simple entier pour l'instant

    @ManyToOne
    @JoinColumn(name = "enseignant_id")
    private User enseignant;

    public Offre() {
        this.datePublication = LocalDate.now();
        this.statut = "active";
        this.nbCandidatures = 0;
    }

    public Offre(String titre, String description, String type, User enseignant) {
        this();
        this.titre = titre;
        this.description = description;
        this.type = type;
        this.enseignant = enseignant;
    }

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

    public User getEnseignant() { return enseignant; }
    public void setEnseignant(User enseignant) { this.enseignant = enseignant; }
}
