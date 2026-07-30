package com.fieldservicemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.Part;

public interface PartRepository extends JpaRepository<Part, Long> {
}