package com.hospital.service;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.entity.RoleEntity;
import com.hospital.repository.RoleRepository;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RoleServiceTest {

    @Autowired
    private RoleService roleService;

    @Autowired
    private RoleRepository roleRepository;

    // ========== Test findAll returns inserted roles ==========
    @Test
    void shouldReturnInsertedRoles() {

        // Arrange
        List<RoleEntity> prevRoles = roleService.findAll();

        String randomA = "ahadsfasdfasdf";
        String randomB = "aaabbbcc1213";

        RoleEntity roleRandomA = new RoleEntity();
        roleRandomA.setRoleName(randomA);
        roleRepository.save(roleRandomA);

        RoleEntity roleRandomB = new RoleEntity();
        roleRandomB.setRoleName(randomB);
        roleRepository.save(roleRandomB);

        // Act
        List<RoleEntity> roles = roleService.findAll();

        // Assert
        assertNotNull(roles);
        assertEquals(2 + prevRoles.size(), roles.size());

        assertTrue(
                roles.stream().anyMatch(r -> randomA.equals(r.getRoleName())),
                "Should contain" + randomA + "role");

        assertTrue(
                roles.stream().anyMatch(r -> randomB.equals(r.getRoleName())),
                "Should contain" + randomB + "role");
    }

    // ========== Test findAll returns empty list when no data ==========
    @Test
    void shouldReturnEmptyListWhenNoRolesExist() {

        // Ensure database is empty
        roleRepository.deleteAll();

        // Act
        List<RoleEntity> roles = roleService.findAll();

        // Assert
        assertNotNull(roles);
        assertTrue(roles.isEmpty());
    }
}