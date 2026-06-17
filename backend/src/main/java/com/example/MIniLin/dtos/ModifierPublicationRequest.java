// ModifierPublicationRequest.java
package com.example.MIniLin.dtos;

import org.springframework.web.multipart.MultipartFile;

public class ModifierPublicationRequest {
    private String titre;
    private String resume;
    private String contenu;
    private String typePublication;
    private MultipartFile fichierJoint;

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getResume() { return resume; }
    public void setResume(String resume) { this.resume = resume; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getTypePublication() { return typePublication; }
    public void setTypePublication(String typePublication) { this.typePublication = typePublication; }

    public MultipartFile getFichierJoint() { return fichierJoint; }
    public void setFichierJoint(MultipartFile fichierJoint) { this.fichierJoint = fichierJoint; }
}