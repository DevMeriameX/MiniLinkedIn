package com.example.MIniLin.models;



public enum StatutVerification {
    EN_ATTENTE,    // Document soumis, pas encore vérifié
    VERIFIE,       // Document authentique, approuvé
    REJETE,        // Document non authentique ou falsifié
    EN_COURS       // Admin est en train de vérifier
}