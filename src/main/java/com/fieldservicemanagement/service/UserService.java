package com.fieldservicemanagement.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fieldservicemanagement.dto.ChangePasswordRequest;
import com.fieldservicemanagement.dto.ProfileResponse;
import com.fieldservicemanagement.dto.UpdateProfileRequest;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.repository.UserRepository;

@Service
public class UserService {

    private static final long MAX_PROFILE_PHOTO_SIZE =
            5 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private static final Path PROFILE_UPLOAD_DIRECTORY =
            Paths.get(
                    "uploads",
                    "profiles"
            );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentProfile(
            String email) {

        User user = findUserByEmail(email);

        return toProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateCurrentProfile(
            String currentEmail,
            UpdateProfileRequest request) {

        User user =
                findUserByEmail(currentEmail);

        String newEmail =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        Optional<User> userWithSameEmail =
                userRepository.findByEmail(
                        newEmail
                );

        if (userWithSameEmail.isPresent()
                && !userWithSameEmail
                        .get()
                        .getId()
                        .equals(user.getId())) {

            throw new IllegalStateException(
                    "Email address is already in use."
            );
        }

        user.setName(
                request.getName().trim()
        );

        user.setEmail(newEmail);

        user.setPhoneNumber(
                cleanOptional(
                        request.getPhoneNumber()
                )
        );

        user.setDepartment(
                cleanOptional(
                        request.getDepartment()
                )
        );

        User savedUser =
                userRepository.save(user);

        return toProfileResponse(savedUser);
    }

    @Transactional
    public ProfileResponse uploadProfilePhoto(
            String email,
            MultipartFile file) {

        User user = findUserByEmail(email);

        validateProfilePhoto(file);

        try {
            Files.createDirectories(
                    PROFILE_UPLOAD_DIRECTORY
            );

            String extension =
                    getExtension(
                            file.getOriginalFilename()
                    );

            String fileName =
                    "user-"
                            + user.getId()
                            + "-"
                            + UUID.randomUUID()
                            + extension;

            Path destination =
                    PROFILE_UPLOAD_DIRECTORY
                            .resolve(fileName)
                            .normalize()
                            .toAbsolutePath();

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            deleteOldProfilePhoto(
                    user.getProfilePhoto()
            );

            String photoPath =
                    "/uploads/profiles/"
                            + fileName;

            user.setProfilePhoto(
                    photoPath
            );

            User savedUser =
                    userRepository.save(user);

            return toProfileResponse(savedUser);

        } catch (IOException exception) {

            throw new RuntimeException(
                    "Unable to save profile photo.",
                    exception
            );
        }
    }

    @Transactional
    public ProfileResponse removeProfilePhoto(
            String email) {

        User user = findUserByEmail(email);

        deleteOldProfilePhoto(
                user.getProfilePhoto()
        );

        user.setProfilePhoto(null);

        User savedUser =
                userRepository.save(user);

        return toProfileResponse(savedUser);
    }

    @Transactional
    public void changePassword(
            String email,
            ChangePasswordRequest request) {

        User user =
                findUserByEmail(email);

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                user.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        if (!request.getNewPassword()
                .equals(
                        request.getConfirmPassword()
                )) {

            throw new IllegalArgumentException(
                    "New password and confirm password do not match."
            );
        }

        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPasswordHash())) {

            throw new IllegalArgumentException(
                    "New password must be different from the current password."
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        userRepository.save(user);
    }

    private void validateProfilePhoto(
            MultipartFile file) {

        if (file == null
                || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Please select a profile photo."
            );
        }

        if (file.getSize()
                > MAX_PROFILE_PHOTO_SIZE) {

            throw new IllegalArgumentException(
                    "Profile photo must be smaller than 5 MB."
            );
        }

        String contentType =
                file.getContentType();

        if (contentType == null
                || !ALLOWED_CONTENT_TYPES
                        .contains(contentType)) {

            throw new IllegalArgumentException(
                    "Only JPG, PNG and WEBP images are allowed."
            );
        }

        String extension =
                getExtension(
                        file.getOriginalFilename()
                );

        if (!Set.of(
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
        ).contains(
                extension.toLowerCase()
        )) {

            throw new IllegalArgumentException(
                    "Invalid image file extension."
            );
        }
    }

    private String getExtension(
            String fileName) {

        if (fileName == null
                || fileName.isBlank()) {

            return "";
        }

        int index =
                fileName.lastIndexOf('.');

        if (index < 0) {
            return "";
        }

        return fileName
                .substring(index)
                .toLowerCase();
    }

    private void deleteOldProfilePhoto(
            String profilePhotoPath) {

        if (profilePhotoPath == null
                || profilePhotoPath.isBlank()
                || !profilePhotoPath.startsWith(
                        "/uploads/profiles/"
                )) {

            return;
        }

        try {
            String oldFileName =
                    profilePhotoPath.substring(
                            "/uploads/profiles/"
                                    .length()
                    );

            Path oldFile =
                    PROFILE_UPLOAD_DIRECTORY
                            .resolve(oldFileName)
                            .normalize()
                            .toAbsolutePath();

            Files.deleteIfExists(oldFile);

        } catch (IOException ignored) {

            // Old photo removal should not
            // prevent a new photo upload.
        }
    }

    private User findUserByEmail(
            String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found."
                        )
                );
    }

    private ProfileResponse toProfileResponse(
            User user) {

        return new ProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDepartment(),
                user.getProfilePhoto(),
                user.getRole(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    private String cleanOptional(
            String value) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}