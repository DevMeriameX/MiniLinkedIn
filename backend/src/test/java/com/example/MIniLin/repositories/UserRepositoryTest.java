package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test") // Utilise la BDD H2 par défaut pour @DataJpaTest ou Testcontainers si configuré
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByEmail_ShouldReturnUser() {
        // Arrange
        User user = new User();
        user.setEmail("test@email.com");
        user.setNomComplet("Test User");
        user.setMotDePasse("password");
        user.setRole(Role.ETUDIANT);
        userRepository.save(user);

        // Act
        Optional<User> found = userRepository.findByEmail("test@email.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Test User", found.get().getNomComplet());
    }

    @Test
    void findByActifFalse_ShouldReturnInactiveUsers() {
        // Arrange
        User activeUser = new User();
        activeUser.setEmail("active@email.com");
        activeUser.setMotDePasse("password");
        activeUser.setNomComplet("Active User");
        activeUser.setRole(Role.ETUDIANT);
        activeUser.setActif(true);
        userRepository.save(activeUser);

        User inactiveUser = new User();
        inactiveUser.setEmail("inactive@email.com");
        inactiveUser.setMotDePasse("password");
        inactiveUser.setNomComplet("Inactive User");
        inactiveUser.setRole(Role.ENSEIGNANT);
        inactiveUser.setActif(false);
        userRepository.save(inactiveUser);

        // Act
        List<User> inactiveUsers = userRepository.findByActifFalse();

        // Assert
        assertEquals(1, inactiveUsers.size());
        assertEquals("inactive@email.com", inactiveUsers.get(0).getEmail());
    }
}
