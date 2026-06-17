package com.example.MIniLin.dtos;

import org.springframework.web.multipart.MultipartFile;

public class ProfilUpdateRequest {
  private String nomComplet;
  private String bio;
  private String filiere;
  private String niveauEtudes;
  private String statutAcademique;
  private String labo;
  private String depart;
  private MultipartFile photoFile;
  private MultipartFile documentFile;

  // Getters et Setters
  public String getNomComplet() {
    return nomComplet;
  }

  public void setNomComplet(String nomComplet) {
    this.nomComplet = nomComplet;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getFiliere() {
    return filiere;
  }

  public void setFiliere(String filiere) {
    this.filiere = filiere;
  }

  public String getLabo() {
    return labo;
  }

  public void setLabo(String labo) {
    this.labo = labo;
  }

  public String getNiveauEtudes() {
    return niveauEtudes;
  }

  public void setNiveauEtudes(String niveauEtudes) {
    this.niveauEtudes = niveauEtudes;
  }

  public String getStatutAcademique() {
    return statutAcademique;
  }

  public void setStatutAcademique(String statutAcademique) {
    this.statutAcademique = statutAcademique;
  }

  public String getDepart() {
    return depart;
  }

  public void setDepart(String depart) {
    this.depart = depart;
  }

  public MultipartFile getPhotoFile() {
    return photoFile;
  }

  public void setPhotoFile(MultipartFile photoFile) {
    this.photoFile = photoFile;
  }

  public MultipartFile getDocumentFile() {
    return documentFile;
  }

  public void setDocumentFile(MultipartFile documentFile) {
    this.documentFile = documentFile;
  }
}
