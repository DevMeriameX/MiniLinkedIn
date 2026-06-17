package com.example.MIniLin.dtos;

import lombok.Data;
import java.util.Map;

@Data
public class StatistiquesDTO {
    private long totalUtilisateurs;
    private long totalEtudiants;
    private long totalEnseignants;
    private long totalAdministrateurs;
    private long utilisateursActifs;
    private long utilisateursInactifs;
    private long totalPublications;
    private long publicationsEnAttente;
    private long publicationsValidees;
    private long publicationsRefusees;
    private long signalementsEnAttente;
    private long signalementsTraites;
    private long signalementsRejetes;

    // Nouveaux champs pour l'activité
    private long connexionsAujourdhui;
    private long totalConnexions;
    private Map<String, Long> activiteRecente;
}