package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "commentaires")
public class Commentaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private User utilisateur;

    @ManyToOne
    @JoinColumn(name = "publication_id")
    private Publication publication;

    @Column(length = 2000)
    private String contenu;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCommentaire;

    // Pour les réponses aux commentaires (auto-référence)
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Commentaire parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Commentaire> reponses = new ArrayList<>();

    private boolean modifie = false;

    // Constructeurs
    public Commentaire() {
        this.dateCommentaire = new Date();
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public Publication getPublication() { return publication; }
    public void setPublication(Publication publication) { this.publication = publication; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public Date getDateCommentaire() { return dateCommentaire; }
    public void setDateCommentaire(Date dateCommentaire) { this.dateCommentaire = dateCommentaire; }

    public Commentaire getParent() { return parent; }
    public void setParent(Commentaire parent) { this.parent = parent; }

    public List<Commentaire> getReponses() { return reponses; }
    public void setReponses(List<Commentaire> reponses) { this.reponses = reponses; }

    public boolean isModifie() { return modifie; }
    public void setModifie(boolean modifie) { this.modifie = modifie; }
}