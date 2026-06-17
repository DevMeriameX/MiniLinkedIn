package com.example.MIniLin.dtos;

import org.springframework.web.multipart.MultipartFile;

public class RegisterRequest {
    private String email;
    private String motDePasse;
    private String nomComplet;
    private String filiere;


    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }


}