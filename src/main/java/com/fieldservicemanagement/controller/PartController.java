package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.entity.Part;
import com.fieldservicemanagement.service.PartService;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartService partService;

    public PartController(
            PartService partService) {

        this.partService = partService;
    }

    @GetMapping
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')"
    )
    public ResponseEntity<List<Part>>
            getAllParts() {

        return ResponseEntity.ok(
                partService.getAllParts()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER', 'TECHNICIAN')"
    )
    public ResponseEntity<Part>
            getPartById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                partService.getPartById(id)
        );
    }

    @PostMapping
    @PreAuthorize(
            "hasRole('MANAGER')"
    )
    public ResponseEntity<Part>
            createPart(
                    @RequestBody Part part) {

        return ResponseEntity.ok(
                partService.createPart(part)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize(
            "hasRole('MANAGER')"
    )
    public ResponseEntity<Part>
            updatePart(
                    @PathVariable Long id,
                    @RequestBody
                    Part updatedPart) {

        return ResponseEntity.ok(
                partService.updatePart(
                        id,
                        updatedPart
                )
        );
    }
}