package com.example.MIniLin.config;

import com.example.MIniLin.models.Offre;
// import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.OffreRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OffreDataLoader {

  @Bean
  CommandLineRunner initOffres(OffreRepository repository, UserRepository userRepository) {
    return args -> {
      if (repository.count() == 0) {
        // On cherche l'enseignant avec l'ID 1 ou le premier enseignant trouvé
        userRepository.findById(1L).ifPresent(enseignant -> {
          repository.saveAll(List.of(
              new Offre("Analyse Prédictive des Marchés Émergents",
                  "Recherche d'un étudiant de Master 2 pour un stage de fin d'études portant sur les modèles ARIMA et le Deep Learning...",
                  "stage", enseignant),
              new Offre("Impact de la Blockchain sur l'Audit Financier",
                  "Projet de recherche doctoral ouvert aux étudiants en double cursus Finance et Informatique. Collaboration avec le Lab-X.",
                  "recherche", enseignant),
              new Offre("Analyse Macroéconomique : Zone Euro 2022",
                  "Projet collectif de fin de semestre pour les étudiants de Licence 3.",
                  "projet", enseignant)));

          // On archive une offre pour la démo
          Offre archive = new Offre("Développement d'un Algorithme de Trading",
              "Stage technique axé sur le Python et les API de données boursières.",
              "stage", enseignant);
          archive.setStatut("archivee");
          archive.setNbCandidatures(5);
          repository.save(archive);
        });
      }
    };
  }
}
