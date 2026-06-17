package com.example.MIniLin.repositories;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@DataJpaTest
@ActiveProfiles("test")
public class RecommandationRepositoryTest {

    @Autowired
    private RecommandationRepository repository;

    @Test
    void testRepositoryLoads() {
        assertNotNull(repository);
    }
}
