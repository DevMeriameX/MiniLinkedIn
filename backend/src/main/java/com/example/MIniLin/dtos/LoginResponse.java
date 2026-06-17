package com.example.MIniLin.dtos;

public class LoginResponse {
    private String token;
    private Long id;
    private String email;
    private String nomComplet;
    private String role;
    private String photo;

    public LoginResponse(String token, Long id, String email, String nomComplet, String role, String photo) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.nomComplet = nomComplet;
        this.role = role;
        this.photo = photo;
    }

    // Getters
    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNomComplet() { return nomComplet; }
    public String getRole() { return role; }
    public String getPhoto() { return photo; }

    // Setters
    public void setToken(String token) { this.token = token; }
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }
    public void setRole(String role) { this.role = role; }
    public void setPhoto(String photo) { this.photo = photo; }
}