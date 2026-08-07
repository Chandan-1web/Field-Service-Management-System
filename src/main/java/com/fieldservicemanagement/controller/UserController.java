package com.fieldservicemanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fieldservicemanagement.dto.ChangePasswordRequest;
import com.fieldservicemanagement.dto.ProfileResponse;
import com.fieldservicemanagement.dto.UpdateProfileRequest;
import com.fieldservicemanagement.dto.UserResponse;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserController(
            UserRepository userRepository,
            UserService userService) {

        this.userRepository =
                userRepository;

        this.userService =
                userService;
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

        return ResponseEntity.ok(
                technicians
        );
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse>
            getMyProfile(
                    Authentication authentication) {

        return ResponseEntity.ok(
                userService.getCurrentProfile(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProfileResponse>
            updateMyProfile(
                    @Valid
                    @RequestBody
                    UpdateProfileRequest request,
                    Authentication authentication) {

        return ResponseEntity.ok(
                userService.updateCurrentProfile(
                        authentication.getName(),
                        request
                )
        );
    }

    @PostMapping(
        value = "/me/profile-photo",
        consumes = "multipart/form-data"
)
public ResponseEntity<ProfileResponse>
        uploadProfilePhoto(
                @RequestParam("file")
                MultipartFile file,
                Authentication authentication) {

    return ResponseEntity.ok(
            userService.uploadProfilePhoto(
                    authentication.getName(),
                    file
            )
    );
}

@DeleteMapping("/me/profile-photo")
public ResponseEntity<ProfileResponse>
        removeProfilePhoto(
                Authentication authentication) {

    return ResponseEntity.ok(
            userService.removeProfilePhoto(
                    authentication.getName()
            )
    );
}
    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String>
            changePassword(
                    @Valid
                    @RequestBody
                    ChangePasswordRequest request,
                    Authentication authentication) {

        userService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                "Password changed successfully."
        );
    }
}