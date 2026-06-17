package com.example.MIniLin.dtos;

import com.example.MIniLin.models.StatutVerification;
import com.example.MIniLin.models.TypeDocument;
import java.util.Date;

public class VerificationDiplomeDTO {
    private Long id;
    private String enseignantNom;
    private String enseignantEmail;
    private String documentNom;
    private String documentUrl;
    private TypeDocument typeDocument;
    private Date dateSoumission;
    private StatutVerification statut;
    private String commentaireAdmin;
    private String etablissement;
    private String diplomeNom;
    private String anneeObtention;
    private String numeroDiplome;  // ← AJOUTÉ
    private boolean actif;

    // Constructeur
    public VerificationDiplomeDTO() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEnseignantNom() { return enseignantNom; }
    public void setEnseignantNom(String enseignantNom) { this.enseignantNom = enseignantNom; }

    public String getEnseignantEmail() { return enseignantEmail; }
    public void setEnseignantEmail(String enseignantEmail) { this.enseignantEmail = enseignantEmail; }

    public String getDocumentNom() { return documentNom; }
    public void setDocumentNom(String documentNom) { this.documentNom = documentNom; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public TypeDocument getTypeDocument() { return typeDocument; }
    public void setTypeDocument(TypeDocument typeDocument) { this.typeDocument = typeDocument; }

    public Date getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(Date dateSoumission) { this.dateSoumission = dateSoumission; }

    public StatutVerification getStatut() { return statut; }
    public void setStatut(StatutVerification statut) { this.statut = statut; }

    public String getCommentaireAdmin() { return commentaireAdmin; }
    public void setCommentaireAdmin(String commentaireAdmin) { this.commentaireAdmin = commentaireAdmin; }

    public String getEtablissement() { return etablissement; }
    public void setEtablissement(String etablissement) { this.etablissement = etablissement; }

    public String getDiplomeNom() { return diplomeNom; }
    public void setDiplomeNom(String diplomeNom) { this.diplomeNom = diplomeNom; }

    public String getAnneeObtention() { return anneeObtention; }
    public void setAnneeObtention(String anneeObtention) { this.anneeObtention = anneeObtention; }

    // ← AJOUTER CES GETTER/SETTER
    public String getNumeroDiplome() { return numeroDiplome; }
    public void setNumeroDiplome(String numeroDiplome) { this.numeroDiplome = numeroDiplome; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}