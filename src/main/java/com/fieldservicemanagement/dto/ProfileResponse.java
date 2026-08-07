package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

import com.fieldservicemanagement.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfileResponse {

    private Long id;

    private String name;

    private String email;

    private String phoneNumber;

    private String department;

    private String profilePhoto;

    private User.Role role;

    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;
}