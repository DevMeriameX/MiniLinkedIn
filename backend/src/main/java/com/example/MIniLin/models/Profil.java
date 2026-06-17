package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profils")
public class Profil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    private String titreProfessionnel;

    @Column(length = 2000)
    private String resume;

    private String ville;
    private String photoCouverture;

    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Formation> formations = new ArrayList<>();

    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Competence> competences = new ArrayList<>();

    // Constructeurs
    public Profil() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public String getTitreProfessionnel() { return titreProfessionnel; }
    public void setTitreProfessionnel(String titreProfessionnel) { this.titreProfessionnel = titreProfessionnel; }

    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getPhotoCouverture() { return photoCouverture; }
    public void setPhotoCouverture(String photoCouverture) { this.photoCouverture = photoCouverture; }

    public List<Experience> getExperiences() { return experiences; }
    public void setExperiences(List<Experience> experiences) { this.experiences = experiences; }

    public List<Formation> getFormations() { return formations; }
    public void setFormations(List<Formation> formations) { this.formations = formations; }

    public List<Competence> getCompetences() { return competences; }
    public void setCompetences(List<Competence> competences) { this.competences = competences; }
}