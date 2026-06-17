package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "publications")
public class Publication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @Column(length = 5000)
    private String contenu;

    @Column(length = 255)
    private String titre;

    @Column(length = 1000)
    private String resume;

    @Enumerated(EnumType.STRING)
    private TypePublication typePublication = TypePublication.PROJET;

    private String image;

    @Temporal(TemporalType.TIMESTAMP)
    private Date datePublication;

    @Enumerated(EnumType.STRING)
    private StatutPublication statut;

    @Column(length = 500)
    private String fichierJointUrl;

    @Column(columnDefinition = "boolean default false")   // 🔧 FIX
    private boolean modifie = false;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateModification;

    @Column(length = 1000)
    private String motifRefus;

    @ManyToOne
    @JoinColumn(name = "co_auteur_id")
    private User coAuteur;

    // Inner enum
    public enum StatutPublication {
        EN_ATTENTE, VALIDE, REFUSE
    }

    public enum TypePublication {
        OFFRE_STAGE, PROJET, COURS, ARTICLE_RECHERCHE
    }

    public Publication() {
        this.datePublication = new Date();
        this.statut = StatutPublication.EN_ATTENTE;
        this.modifie = false;
    }

    // Getters / Setters (all)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }

    public TypePublication getTypePublication() { return typePublication; }
    public void setTypePublication(TypePublication typePublication) { this.typePublication = typePublication; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Date getDatePublication() { return datePublication; }
    public void setDatePublication(Date datePublication) { this.datePublication = datePublication; }

    public StatutPublication getStatut() { return statut; }
    public void setStatut(StatutPublication statut) { this.statut = statut; }

    public String getFichierJointUrl() { return fichierJointUrl; }
    public void setFichierJointUrl(String fichierJointUrl) { this.fichierJointUrl = fichierJointUrl; }

    public boolean isModifie() { return modifie; }
    public void setModifie(boolean modifie) { this.modifie = modifie; }

    public Date getDateModification() { return dateModification; }
    public void setDateModification(Date dateModification) { this.dateModification = dateModification; }

    public User getCoAuteur() { return coAuteur; }
    public void setCoAuteur(User coAuteur) { this.coAuteur = coAuteur; }

    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }
}