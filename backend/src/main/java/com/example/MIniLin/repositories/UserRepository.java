package com.example.MIniLin.repositories;

import com.example.MIniLin.models.Role;
import com.example.MIniLin.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByActifFalse();
    List<User> findByRoleAndActif(Role role, boolean actif);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByActif(boolean actif);
    long countByLastLoginAfter(Date date);
    long countByLastLoginIsNotNull();
    List<User> findByNomCompletContainingIgnoreCaseOrEmailContainingIgnoreCase(String nom, String email);
    List<User> findByActifTrueAndIdNot(Long id);
}