package com.example.MIniLin.services;

import com.example.MIniLin.models.PasswordResetToken;
import com.example.MIniLin.models.User;
import com.example.MIniLin.repositories.PasswordResetTokenRepository;
import com.example.MIniLin.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User user;
    private PasswordResetToken token;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("user@test.com");
        user.setMotDePasse("oldPassword");

        token = new PasswordResetToken("valid-token", user);
    }

    @Test
    void creerTokenReinitialisation_Success() {
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(i -> i.getArgument(0));

        String generatedToken = passwordResetService.creerTokenReinitialisation("user@test.com");

        assertNotNull(generatedToken);
        verify(tokenRepository, times(1)).deleteByUtilisateur(user); // Delete old tokens
        verify(tokenRepository, times(1)).save(any(PasswordResetToken.class));
    }

    @Test
    void creerTokenReinitialisation_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            passwordResetService.creerTokenReinitialisation("unknown@test.com");
        });
        assertEquals("Email non trouvé", ex.getMessage());
    }

    @Test
    void reinitialiserMotDePasse_Success() {
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        
        passwordResetService.reinitialiserMotDePasse("valid-token", "newPassword");

        assertEquals("encodedNewPassword", user.getMotDePasse());
        assertTrue(token.isUtilise());
        verify(userRepository, times(1)).save(user);
        verify(tokenRepository, times(1)).save(token);
    }

    @Test
    void reinitialiserMotDePasse_TokenUsed_ThrowsException() {
        token.setUtilise(true);
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            passwordResetService.reinitialiserMotDePasse("valid-token", "newPassword");
        });
        assertEquals("Ce token a déjà été utilisé", ex.getMessage());
    }

    @Test
    void reinitialiserMotDePasse_TokenExpired_ThrowsException() throws Exception {
        // Simulation expiration via reflection
        Field dateExpirationField = PasswordResetToken.class.getDeclaredField("dateExpiration");
        dateExpirationField.setAccessible(true);
        dateExpirationField.set(token, new Date(System.currentTimeMillis() - 10000)); // Past date
        
        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            passwordResetService.reinitialiserMotDePasse("valid-token", "newPassword");
        });
        assertEquals("Ce token a expiré", ex.getMessage());
    }
}
