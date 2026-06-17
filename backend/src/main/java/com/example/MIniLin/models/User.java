package com.example.MIniLin.models;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "utilisateurs")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true)
  private String email;

  private String motDePasse;
  private String nomComplet;

  @Enumerated(EnumType.STRING)
  private Role role;

  private String photo;
  private String document;
  private Date dateInscription;

  // Champs spécifiques
  private String filiere; // pour Etudiant
  private String niveauEtudes; // pour Etudiant
  private String statutAcademique; // ETUDIANT ou CHERCHEUR
  private String labo; // pour Enseignant
  private String depart; // pour Enseignant
  private String universite; // NOUVEAU

  @Column(length = 2000)
  private String bio;
  @Temporal(TemporalType.TIMESTAMP)
  private Date lastLogin;
  private boolean actif = true;

  // Constructeurs
  public User() {
    this.dateInscription = new Date();
  }

  // Getters et Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getMotDePasse() { return motDePasse; }
  public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

  public String getNomComplet() { return nomComplet; }
  public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

  public Role getRole() { return role; }
  public void setRole(Role role) { this.role = role; }

  public String getPhoto() { return photo; }
  public void setPhoto(String photo) { this.photo = photo; }

  public String getDocument() { return document; }
  public void setDocument(String document) { this.document = document; }

  public Date getDateInscription() { return dateInscription; }
  public void setDateInscription(Date dateInscription) { this.dateInscription = dateInscription; }

  public String getFiliere() { return filiere; }
  public void setFiliere(String filiere) { this.filiere = filiere; }

  public String getNiveauEtudes() { return niveauEtudes; }
  public void setNiveauEtudes(String niveauEtudes) { this.niveauEtudes = niveauEtudes; }

  public String getStatutAcademique() { return statutAcademique; }
  public void setStatutAcademique(String statutAcademique) { this.statutAcademique = statutAcademique; }

  public String getLabo() { return labo; }
  public void setLabo(String labo) { this.labo = labo; }

  public String getDepart() { return depart; }
  public void setDepart(String depart) { this.depart = depart; }

  public String getUniversite() { return universite; }
  public void setUniversite(String universite) { this.universite = universite; }

  public String getBio() { return bio; }
  public void setBio(String bio) { this.bio = bio; }

  public Date getLastLogin() { return lastLogin; }
  public void setLastLogin(Date lastLogin) { this.lastLogin = lastLogin; }

  public boolean isActif() { return actif; }
  public void setActif(boolean actif) { this.actif = actif; }
}