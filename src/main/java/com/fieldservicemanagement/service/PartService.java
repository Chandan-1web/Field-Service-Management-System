package com.fieldservicemanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fieldservicemanagement.entity.Part;
import com.fieldservicemanagement.repository.PartRepository;

@Service
public class PartService {

    private final PartRepository partRepository;

    public PartService(
            PartRepository partRepository) {

        this.partRepository = partRepository;
    }

    @Transactional(readOnly = true)
    public List<Part> getAllParts() {

        return partRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Part getPartById(Long id) {

        return partRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Part not found with id: "
                                        + id
                        )
                );
    }

    @Transactional
    public Part createPart(Part part) {

        if (part.getName() == null
                || part.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Part name is required."
            );
        }

        if (part.getSku() == null
                || part.getSku().isBlank()) {

            throw new IllegalArgumentException(
                    "SKU is required."
            );
        }

        if (part.getUnitCost() == null
                || part.getUnitCost()
                        .signum() < 0) {

            throw new IllegalArgumentException(
                    "Unit cost cannot be negative."
            );
        }

        if (part.getStockQty() == null
                || part.getStockQty() < 0) {

            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative."
            );
        }

        return partRepository.save(part);
    }

    @Transactional
    public Part updatePart(
            Long id,
            Part updatedPart) {

        Part existingPart =
                partRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Part not found with id: "
                                                + id
                                )
                        );

        if (updatedPart.getName() != null
                && !updatedPart
                        .getName()
                        .isBlank()) {

            existingPart.setName(
                    updatedPart.getName().trim()
            );
        }

        if (updatedPart.getSku() != null
                && !updatedPart
                        .getSku()
                        .isBlank()) {

            existingPart.setSku(
                    updatedPart
                            .getSku()
                            .trim()
            );
        }

        if (updatedPart.getUnitCost()
                != null) {

            if (updatedPart
                    .getUnitCost()
                    .signum() < 0) {

                throw new IllegalArgumentException(
                        "Unit cost cannot be negative."
                );
            }

            existingPart.setUnitCost(
                    updatedPart.getUnitCost()
            );
        }

        if (updatedPart.getStockQty()
                != null) {

            if (updatedPart
                    .getStockQty() < 0) {

                throw new IllegalArgumentException(
                        "Stock quantity cannot be negative."
                );
            }

            existingPart.setStockQty(
                    updatedPart.getStockQty()
            );
        }

        return partRepository.save(
                existingPart
        );
    }
}