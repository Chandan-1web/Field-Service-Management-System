package com.fieldservicemanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fieldservicemanagement.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
	
    Optional<User> findByEmail(String email);
}