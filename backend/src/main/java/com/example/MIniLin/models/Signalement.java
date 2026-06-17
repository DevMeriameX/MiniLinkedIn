package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "signalements")
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "publication_id", nullable = false)
    private Publication publication;

    @ManyToOne
    @JoinColumn(name = "signaleur_id", nullable = false)
    private User signaleur;

    @Column(length = 500)
    private String raison;

    public Date getDateSignalement() {
        return dateSignalement;
    }

    public void setDateSignalement(Date dateSignalement) {
        this.dateSignalement = dateSignalement;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Publication getPublication() {
        return publication;
    }

    public void setPublication(Publication publication) {
        this.publication = publication;
    }

    public User getSignaleur() {
        return signaleur;
    }

    public void setSignaleur(User signaleur) {
        this.signaleur = signaleur;
    }

    public String getRaison() {
        return raison;
    }

    public void setRaison(String raison) {
        this.raison = raison;
    }

    public StatutSignalement getStatut() {
        return statut;
    }

    public void setStatut(StatutSignalement statut) {
        this.statut = statut;
    }

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateSignalement;

    @Enumerated(EnumType.STRING)
    private StatutSignalement statut = StatutSignalement.EN_ATTENTE;

    public enum StatutSignalement {
        EN_ATTENTE, TRAITE, REJETE
    }

    // Constructeurs
    public Signalement() {
        this.dateSignalement = new Date();
    }

    // Getters / Setters (générés automatiquement)
}