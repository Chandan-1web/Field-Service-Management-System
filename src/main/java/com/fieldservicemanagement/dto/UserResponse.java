package com.fieldservicemanagement.dto;

import com.fieldservicemanagement.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private User.Role role;
}