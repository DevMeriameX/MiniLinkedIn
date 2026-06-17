package com.example.MIniLin.config;

import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {

            String adminEmail = "admin@gmail.com";

            if (!userRepository.existsByEmail(adminEmail)) {

                User admin = new User();
                admin.setEmail(adminEmail);
                admin.setNomComplet("Admin System");
                admin.setMotDePasse(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setActif(true);

                userRepository.save(admin);

                System.out.println("✅ Admin créé avec succès !");
            }
        };
    }
}