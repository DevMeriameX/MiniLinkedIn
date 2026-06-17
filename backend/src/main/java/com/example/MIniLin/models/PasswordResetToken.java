package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    @OneToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    private boolean utilise = false;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateExpiration;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    // Constructeurs
    public PasswordResetToken() {
        this.dateCreation = new Date();
        this.dateExpiration = new Date(System.currentTimeMillis() + 3600000); // 1 heure
    }

    public PasswordResetToken(String token, User utilisateur) {
        this();
        this.token = token;
        this.utilisateur = utilisateur;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public boolean isUtilise() { return utilise; }
    public void setUtilise(boolean utilise) { this.utilise = utilise; }

    public Date getDateExpiration() { return dateExpiration; }
    public void setDateExpiration(Date dateExpiration) { this.dateExpiration = dateExpiration; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public boolean isExpired() {
        return new Date().after(this.dateExpiration);
    }
}