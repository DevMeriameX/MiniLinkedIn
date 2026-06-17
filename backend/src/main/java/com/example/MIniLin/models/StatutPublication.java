package com.example.MIniLin.models;

public enum StatutPublication {
    EN_ATTENTE,    // Publication soumise, en attente de validation admin
    VALIDE,        // Publication approuvée et visible
    REFUSE         // Publication rejetée par l'admin
}