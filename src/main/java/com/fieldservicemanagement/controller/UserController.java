package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fieldservicemanagement.dto.UserResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(
            UserRepository userRepository) {

        this.userRepository = userRepository;
    }

    @GetMapping("/technicians")
    @PreAuthorize(
            "hasAnyRole('MANAGER', 'DISPATCHER')"
    )
    public ResponseEntity<List<UserResponse>>
            getTechnicians() {

        List<UserResponse> technicians =
                userRepository
                        .findByRole(
                                User.Role.TECHNICIAN
                        )
                        .stream()
                        .map(user ->
                                new UserResponse(
                                        user.getId(),
                                        user.getName(),
                                        user.getEmail(),
                                        user.getRole()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(technicians);
    }
}