// TraiterSignalementRequest.java
package com.example.MIniLin.dtos;
import lombok.Data;

@Data
public class TraiterSignalementRequest {
    private Long signalementId;
    private String action; // "SUPPRIMER_PUBLICATION", "IGNORER"
    private String commentaire;
}