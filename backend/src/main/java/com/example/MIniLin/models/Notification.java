package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    private String message;

    @Enumerated(EnumType.STRING)
    private StatutNotification statut;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateNotification;

    public enum StatutNotification {
        LU,
        NON_LU
    }

    // Constructeurs
    public Notification() {
        this.statut = StatutNotification.NON_LU;
        this.dateNotification = new Date();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public StatutNotification getStatut() { return statut; }
    public void setStatut(StatutNotification statut) { this.statut = statut; }

    public Date getDateNotification() { return dateNotification; }
    public void setDateNotification(Date dateNotification) { this.dateNotification = dateNotification; }
}