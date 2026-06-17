package com.example.MIniLin.dtos;


import com.example.MIniLin.models.StatutVerification;

public class TraiterVerificationRequest {
    private Long verificationId;
    private StatutVerification statut;
    private String commentaire;
    private String methodeVerification;
    private String contactVerification;
    private String notesVerification;

    // Getters et Setters
    public Long getVerificationId() { return verificationId; }
    public void setVerificationId(Long verificationId) { this.verificationId = verificationId; }

    public StatutVerification getStatut() { return statut; }
    public void setStatut(StatutVerification statut) { this.statut = statut; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public String getMethodeVerification() { return methodeVerification; }
    public void setMethodeVerification(String methodeVerification) { this.methodeVerification = methodeVerification; }

    public String getContactVerification() { return contactVerification; }
    public void setContactVerification(String contactVerification) { this.contactVerification = contactVerification; }

    public String getNotesVerification() { return notesVerification; }
    public void setNotesVerification(String notesVerification) { this.notesVerification = notesVerification; }
}