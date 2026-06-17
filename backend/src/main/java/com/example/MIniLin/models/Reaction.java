package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "reactions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"utilisateur_id", "publication_id"})
})
public class Reaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @ManyToOne
    @JoinColumn(name = "publication_id")
    private Publication publication;

    @Enumerated(EnumType.STRING)
    private TypeReaction type;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateReaction;

    // Enum pour les types de réaction
    public enum TypeReaction {
        LIKE,
        LOVE,
        HAHA,
        WOW,
        SAD,
        ANGRY
    }

    // Constructeurs
    public Reaction() {
        this.dateReaction = new Date();
    }

    public Reaction(User utilisateur, Publication publication, TypeReaction type) {
        this.utilisateur = utilisateur;
        this.publication = publication;
        this.type = type;
        this.dateReaction = new Date();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }

    public TypeReaction getType() { return type; }
    public void setType(TypeReaction type) { this.type = type; }

    public Date getDateReaction() { return dateReaction; }
    public void setDateReaction(Date dateReaction) { this.dateReaction = dateReaction; }
}