
package com.fieldservicemanagement.dto;

import com.fieldservicemanagement.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserRequest {

    @NotBlank(message = "Name is required.")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 100)
    private String department;

    @NotNull(message = "Role is required.")
    private User.Role role;

    @NotBlank(message = "Temporary password is required.")
    @Size(
        min = 8,
        max = 100,
        message = "Temporary password must contain at least 8 characters."
    )
    private String temporaryPassword;
}