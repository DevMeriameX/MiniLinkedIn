package com.example.MIniLin.dtos;

public class MessageRequest {
    private Long destinataireId;
    private String contenu;

    // Getters et Setters
    public Long getDestinataireId() { return destinataireId; }
    public void setDestinataireId(Long destinataireId) { this.destinataireId = destinataireId; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
}
