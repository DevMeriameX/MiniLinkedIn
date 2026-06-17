package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "recommandations")
public class Recommandation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "enseignant_id", nullable = false)
    private User enseignant;

    @ManyToOne
    @JoinColumn(name = "etudiant_id", nullable = false)
    private User etudiant;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "date_recommandation")
    private Date dateRecommandation;

    public Recommandation() {}

    public Recommandation(User enseignant, User etudiant, Date dateRecommandation) {
        this.enseignant = enseignant;
        this.etudiant = etudiant;
        this.dateRecommandation = dateRecommandation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getEnseignant() {
        return enseignant;
    }

    public void setEnseignant(User enseignant) {
        this.enseignant = enseignant;
    }

    public User getEtudiant() {
        return etudiant;
    }

    public void setEtudiant(User etudiant) {
        this.etudiant = etudiant;
    }

    public Date getDateRecommandation() {
        return dateRecommandation;
    }

    public void setDateRecommandation(Date dateRecommandation) {
        this.dateRecommandation = dateRecommandation;
    }
}
