package com.example.MIniLin.dtos;


import com.example.MIniLin.models.TypeDocument;
import org.springframework.web.multipart.MultipartFile;

public class SoumettreDiplomeRequest {
    private TypeDocument typeDocument;
    private String etablissement;
    private String diplomeNom;
    private String anneeObtention;
    private String numeroDiplome;
    private MultipartFile document;

    // Getters et Setters
    public TypeDocument getTypeDocument() { return typeDocument; }
    public void setTypeDocument(TypeDocument typeDocument) { this.typeDocument = typeDocument; }

    public String getEtablissement() { return etablissement; }
    public void setEtablissement(String etablissement) { this.etablissement = etablissement; }

    public String getDiplomeNom() { return diplomeNom; }
    public void setDiplomeNom(String diplomeNom) { this.diplomeNom = diplomeNom; }

    public String getAnneeObtention() { return anneeObtention; }
    public void setAnneeObtention(String anneeObtention) { this.anneeObtention = anneeObtention; }

    public String getNumeroDiplome() { return numeroDiplome; }
    public void setNumeroDiplome(String numeroDiplome) { this.numeroDiplome = numeroDiplome; }

    public MultipartFile getDocument() { return document; }
    public void setDocument(MultipartFile document) { this.document = document; }
}