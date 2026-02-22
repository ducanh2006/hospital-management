package com.hospital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.entity.RoleEntity;
import com.hospital.service.RoleService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService service;

    @GetMapping
    public ResponseEntity<List<RoleEntity>> getAll() {
        List<RoleEntity> roles = service.findAll();
        return ResponseEntity.ok(roles);
    }
}
