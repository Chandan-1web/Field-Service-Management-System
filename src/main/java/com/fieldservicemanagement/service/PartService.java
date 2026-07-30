package com.fieldservicemanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fieldservicemanagement.entity.Part;
import com.fieldservicemanagement.repository.PartRepository;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    // Get all parts
    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    // Get part by ID
    public Part getPartById(Long id) {
        return partRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Part not found with id: " + id));
    }

    // Add new part
    public Part createPart(Part part) {
        return partRepository.save(part);
    }
}