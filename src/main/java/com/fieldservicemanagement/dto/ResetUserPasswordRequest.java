package com.fieldservicemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetUserPasswordRequest {

    @NotBlank(
        message = "New temporary password is required."
    )
    @Size(
        min = 8,
        max = 100,
        message = "Password must contain at least 8 characters."
    )
    private String temporaryPassword;
}