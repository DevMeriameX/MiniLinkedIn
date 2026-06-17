package com.example.MIniLin.services;

import com.example.MIniLin.config.JwtUtil;
import com.example.MIniLin.dtos.LoginRequest;
import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setMotDePasse("encodedPassword");
        testUser.setRole(Role.ETUDIANT);
        testUser.setActif(true);

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setMotDePasse("password123");
    }

    @Test
    void login_Success() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("test@example.com", "ETUDIANT")).thenReturn("mocked-jwt-token");

        // Act
        String token = authService.login(loginRequest);

        // Assert
        assertNotNull(token);
        assertEquals("mocked-jwt-token", token);
        verify(userRepository, times(1)).save(testUser); // Vérifie la màj de lastLogin
    }

    @Test
    void login_Failure_WrongPassword() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Email ou mot de passe incorrect", exception.getMessage());
        verify(jwtUtil, never()).generateToken(anyString(), anyString());
    }

    @Test
    void login_Failure_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Email ou mot de passe incorrect", exception.getMessage());
    }

    @Test
    void login_Failure_UserInactive() {
        // Arrange
        testUser.setActif(false);
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.login(loginRequest));
        assertEquals("Compte désactivé. Contactez l'administrateur.", exception.getMessage());
    }

    @Test
    void register_Success() {
        // Arrange
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        User registeredUser = authService.register("new@example.com", "password123", "New User", Role.ETUDIANT);

        // Assert
        assertNotNull(registeredUser);
        assertEquals("new@example.com", registeredUser.getEmail());
        assertEquals("encodedPassword", registeredUser.getMotDePasse());
        assertEquals(Role.ETUDIANT, registeredUser.getRole());
        assertFalse(registeredUser.isActif()); // ETUDIANT not active by default
    }

    @Test
    void register_Failure_EmailExists() {
        // Arrange
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> authService.register("test@example.com", "password123", "New User", Role.ETUDIANT));
        assertEquals("Email déjà utilisé", exception.getMessage());
    }
}
