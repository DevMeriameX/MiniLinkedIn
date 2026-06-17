package com.example.MIniLin.dtos;

public class ChangePasswordRequest {
    private String email;
    private String ancienMotDePasse;
    private String nouveauMotDePasse;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAncienMotDePasse() { return ancienMotDePasse; }
    public void setAncienMotDePasse(String ancienMotDePasse) { this.ancienMotDePasse = ancienMotDePasse; }

    public String getNouveauMotDePasse() { return nouveauMotDePasse; }
    public void setNouveauMotDePasse(String nouveauMotDePasse) { this.nouveauMotDePasse = nouveauMotDePasse; }
}