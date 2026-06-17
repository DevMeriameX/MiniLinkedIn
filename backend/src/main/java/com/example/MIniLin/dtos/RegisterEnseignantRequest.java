package com.example.MIniLin.dtos;

import org.springframework.web.multipart.MultipartFile;

public class RegisterEnseignantRequest {
    private String email;
    private String motDePasse;
    private String nomComplet;
    private String labo;
    private String depart;
    private MultipartFile document;

    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getLabo() { return labo; }
    public void setLabo(String labo) { this.labo = labo; }

    public String getDepart() { return depart; }
    public void setDepart(String depart) { this.depart = depart; }

    public MultipartFile getDocument() { return document; }
    public void setDocument(MultipartFile document) { this.document = document; }
}