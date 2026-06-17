package com.example.MIniLin.dtos;

import org.springframework.web.multipart.MultipartFile;

public class RegisterSimpleRequest {
    private String email;
    private String motDePasse;
    private String nomComplet;
    private String role;  // "ETUDIANT" ou "ENSEIGNANT"
    private MultipartFile document;  // Optionnel

    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public MultipartFile getDocument() { return document; }
    public void setDocument(MultipartFile document) { this.document = document; }
}