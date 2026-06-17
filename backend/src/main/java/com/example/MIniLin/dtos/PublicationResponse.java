// PublicationResponse.java
package com.example.MIniLin.dtos;

import java.util.Date;

public class PublicationResponse {
    private Long id;
    private String titre;
    private String resume;
    private String typePublication;
    private String contenu;
    private String fichierUrl;
    private String fichierNom;
    private String fichierType;
    private Date datePublication;
    private String statut;
    private String auteurNom;
    private Long auteurId;
    private String auteurRole;
    private String auteurPhoto;
    private int nombreCommentaires;
    private int nombreReactions;
    private Long coAuthorId;
    private String coAuthorNom;
    private String motifRefus;

    public PublicationResponse() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }

    public String getTypePublication() { return typePublication; }
    public void setTypePublication(String typePublication) { this.typePublication = typePublication; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getFichierUrl() { return fichierUrl; }
    public void setFichierUrl(String fichierUrl) { this.fichierUrl = fichierUrl; }

    public String getFichierNom() { return fichierNom; }
    public void setFichierNom(String fichierNom) { this.fichierNom = fichierNom; }

    public String getFichierType() { return fichierType; }
    public void setFichierType(String fichierType) { this.fichierType = fichierType; }

    public Date getDatePublication() { return datePublication; }
    public void setDatePublication(Date datePublication) { this.datePublication = datePublication; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getAuteurNom() { return auteurNom; }
    public void setAuteurNom(String auteurNom) { this.auteurNom = auteurNom; }

    public Long getAuteurId() { return auteurId; }
    public void setAuteurId(Long auteurId) { this.auteurId = auteurId; }

    public String getAuteurRole() { return auteurRole; }
    public void setAuteurRole(String auteurRole) { this.auteurRole = auteurRole; }

    public String getAuteurPhoto() { return auteurPhoto; }
    public void setAuteurPhoto(String auteurPhoto) { this.auteurPhoto = auteurPhoto; }

    public int getNombreCommentaires() { return nombreCommentaires; }
    public void setNombreCommentaires(int nombreCommentaires) { this.nombreCommentaires = nombreCommentaires; }

    public int getNombreReactions() { return nombreReactions; }
    public void setNombreReactions(int nombreReactions) { this.nombreReactions = nombreReactions; }

    public Long getCoAuthorId() { return coAuthorId; }
    public void setCoAuthorId(Long coAuthorId) { this.coAuthorId = coAuthorId; }

    public String getCoAuthorNom() { return coAuthorNom; }
    public void setCoAuthorNom(String coAuthorNom) { this.coAuthorNom = coAuthorNom; }

    public String getMotifRefus() { return motifRefus; }
    public void setMotifRefus(String motifRefus) { this.motifRefus = motifRefus; }
}