package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(
            max = 100,
            message = "Name cannot exceed 100 characters"
    )
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(
            max = 150,
            message = "Email cannot exceed 150 characters"
    )
    private String email;

    @Pattern(
            regexp = "^$|^[0-9+\\- ]{7,20}$",
            message = "Enter a valid phone number"
    )
    private String phoneNumber;

    @Size(
            max = 100,
            message = "Department cannot exceed 100 characters"
    )
    private String department;
}