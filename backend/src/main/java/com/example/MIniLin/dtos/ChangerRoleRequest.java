// ChangerRoleRequest.java
package com.example.MIniLin.dtos;
import lombok.Data;

@Data
public class ChangerRoleRequest {
    private Long userId;
    private String nouveauRole; // "ADMIN", "ENSEIGNANT", "ETUDIANT"
}