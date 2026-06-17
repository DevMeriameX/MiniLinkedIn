package com.example.MIniLin.controllers;

import com.example.MIniLin.dtos.OffreResponseDTO;
import com.example.MIniLin.services.OffreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/etudiant/offres")
@CrossOrigin(origins = "http://localhost:5173")
public class EtudiantOffreController {

    @Autowired
    private OffreService offreService;

    @GetMapping
    public ResponseEntity<?> getAllOffres() {
        List<OffreResponseDTO> offres = offreService.getAllActiveOffres();
        return ResponseEntity.ok(Map.of("count", offres.size(), "offres", offres));
    }
}