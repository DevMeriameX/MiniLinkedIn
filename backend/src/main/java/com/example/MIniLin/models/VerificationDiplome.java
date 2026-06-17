package com.example.MIniLin.models;


import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "verifications_diplomes")
public class VerificationDiplome {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "enseignant_id")
    private User enseignant;

    private String documentUrl;
    private String documentNom;

    @Enumerated(EnumType.STRING)
    private TypeDocument typeDocument;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateSoumission;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateVerification;

    @Enumerated(EnumType.STRING)
    private StatutVerification statut;

    @Column(length = 1000)
    private String commentaireAdmin;

    private String etablissement;
    private String diplomeNom;
    private String anneeObtention;
    private String numeroDiplome;

    private boolean verificationManuelle;
    private String methodeVerification;
    private String contactVerification;

    @Column(length = 2000)
    private String notesVerification;

    private boolean actif = true;

    // Constructeurs
    public VerificationDiplome() {
        this.dateSoumission = new Date();
        this.statut = StatutVerification.EN_ATTENTE;
        this.verificationManuelle = false;
        this.actif = true;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getEnseignant() { return enseignant; }
    public void setEnseignant(User enseignant) { this.enseignant = enseignant; }

    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

    public String getDocumentNom() { return documentNom; }
    public void setDocumentNom(String documentNom) { this.documentNom = documentNom; }

    public TypeDocument getTypeDocument() { return typeDocument; }
    public void setTypeDocument(TypeDocument typeDocument) { this.typeDocument = typeDocument; }

    public Date getDateSoumission() { return dateSoumission; }
    public void setDateSoumission(Date dateSoumission) { this.dateSoumission = dateSoumission; }

    public Date getDateVerification() { return dateVerification; }
    public void setDateVerification(Date dateVerification) { this.dateVerification = dateVerification; }

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

    public String getNumeroDiplome() { return numeroDiplome; }
    public void setNumeroDiplome(String numeroDiplome) { this.numeroDiplome = numeroDiplome; }

    public boolean isVerificationManuelle() { return verificationManuelle; }
    public void setVerificationManuelle(boolean verificationManuelle) { this.verificationManuelle = verificationManuelle; }

    public String getMethodeVerification() { return methodeVerification; }
    public void setMethodeVerification(String methodeVerification) { this.methodeVerification = methodeVerification; }

    public String getContactVerification() { return contactVerification; }
    public void setContactVerification(String contactVerification) { this.contactVerification = contactVerification; }

    public String getNotesVerification() { return notesVerification; }
    public void setNotesVerification(String notesVerification) { this.notesVerification = notesVerification; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}