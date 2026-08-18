package com.fieldservicemanagement.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fieldservicemanagement.dto.ChangePasswordRequest;
import com.fieldservicemanagement.dto.CreateUserRequest;
import com.fieldservicemanagement.dto.ManagedUserResponse;
import com.fieldservicemanagement.dto.ProfileResponse;
import com.fieldservicemanagement.dto.ResetUserPasswordRequest;
import com.fieldservicemanagement.dto.TechnicianWorkloadResponse;
import com.fieldservicemanagement.dto.UpdateManagedUserRequest;
import com.fieldservicemanagement.dto.UpdateProfileRequest;
import com.fieldservicemanagement.entity.User;
import com.fieldservicemanagement.entity.WorkOrder;
import com.fieldservicemanagement.repository.UserRepository;
import com.fieldservicemanagement.repository.WorkOrderRepository;

@Service
public class UserService {

    // =========================================================
    // PROFILE PHOTO CONFIGURATION
    // =========================================================

    private static final long MAX_PROFILE_PHOTO_SIZE =
            5 * 1024 * 1024;

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/png",
                    "image/webp"
            );

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".webp"
            );

    private static final String CLOUDINARY_PROFILE_FOLDER =
            "field-service-management/profile-photos";

    // =========================================================
    // DEPENDENCIES
    // =========================================================

    private final UserRepository userRepository;
    private final WorkOrderRepository workOrderRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;

    public UserService(
            UserRepository userRepository,
            WorkOrderRepository workOrderRepository,
            PasswordEncoder passwordEncoder,
            Cloudinary cloudinary) {

        this.userRepository = userRepository;
        this.workOrderRepository = workOrderRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinary = cloudinary;
    }

    // =========================================================
    // CURRENT USER PROFILE
    // =========================================================

    @Transactional(readOnly = true)
    public ProfileResponse getCurrentProfile(
            String email) {

        User user =
                findUserByEmail(email);

        return toProfileResponse(user);
    }

    // =========================================================
    // UPDATE CURRENT PROFILE
    // =========================================================

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

    // =========================================================
    // PROFILE PHOTO - CLOUDINARY UPLOAD
    // =========================================================

    @Transactional
    public ProfileResponse uploadProfilePhoto(
            String email,
            MultipartFile file) {

        User user =
                findUserByEmail(email);

        validateProfilePhoto(file);

        String publicId =
                buildProfilePhotoPublicId(
                        user.getId()
                );

        try {

            Map<?, ?> uploadResult =
                    cloudinary
                            .uploader()
                            .upload(
                                    file.getBytes(),
                                    ObjectUtils.asMap(
                                            "public_id",
                                            publicId,

                                            "resource_type",
                                            "image",

                                            "overwrite",
                                            true,

                                            "invalidate",
                                            true
                                    )
                            );

            Object secureUrlObject =
                    uploadResult.get(
                            "secure_url"
                    );

            if (secureUrlObject == null) {

                throw new IllegalStateException(
                        "Cloudinary did not return a secure image URL."
                );
            }

            String secureUrl =
                    secureUrlObject.toString();

            if (secureUrl.isBlank()) {

                throw new IllegalStateException(
                        "Cloudinary returned an empty image URL."
                );
            }

            // Store the permanent Cloudinary HTTPS URL
            // directly in the database.
            user.setProfilePhoto(
                    secureUrl
            );

            User savedUser =
                    userRepository.save(user);

            return toProfileResponse(
                    savedUser
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to upload profile photo to Cloudinary.",
                    exception
            );
        }
    }

    // =========================================================
    // REMOVE PROFILE PHOTO - CLOUDINARY
    // =========================================================

    @Transactional
    public ProfileResponse removeProfilePhoto(
            String email) {

        User user =
                findUserByEmail(email);

        String existingPhoto =
                user.getProfilePhoto();

        /*
         * Only attempt Cloudinary deletion when the database
         * currently contains a Cloudinary URL.
         *
         * Old /uploads/profiles/... values from your previous
         * Render-local implementation are simply cleared from
         * the database because those files may already have
         * disappeared from Render.
         */
        if (existingPhoto != null
                && !existingPhoto.isBlank()
                && isCloudinaryUrl(existingPhoto)) {

            String publicId =
                    buildProfilePhotoPublicId(
                            user.getId()
                    );

            try {

                cloudinary
                        .uploader()
                        .destroy(
                                publicId,
                                ObjectUtils.asMap(
                                        "resource_type",
                                        "image",
                                        "invalidate",
                                        true
                                )
                        );

            } catch (Exception exception) {

                /*
                 * We do not want a failed Cloudinary deletion
                 * to leave the user's database profile stuck.
                 *
                 * The database value will still be cleared.
                 */
                System.err.println(
                        "Unable to delete old Cloudinary profile photo: "
                                + exception.getMessage()
                );
            }
        }

        user.setProfilePhoto(null);

        User savedUser =
                userRepository.save(user);

        return toProfileResponse(
                savedUser
        );
    }

    // =========================================================
    // CURRENT USER CHANGE PASSWORD
    // =========================================================

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

    // =========================================================
    // MANAGER - USER MANAGEMENT
    // =========================================================

    /**
     * Manager can view all non-manager user accounts.
     */
    @Transactional(readOnly = true)
    public List<ManagedUserResponse>
            getAllManagedUsers() {

        return userRepository
                .findAll()
                .stream()
                .filter(user ->
                        user.getRole()
                                != User.Role.MANAGER
                )
                .map(this::toManagedUserResponse)
                .toList();
    }

    /**
     * Manager can view one managed user.
     */
    @Transactional(readOnly = true)
    public ManagedUserResponse getManagedUserById(
            Long userId) {

        User user =
                findManagedUserById(userId);

        return toManagedUserResponse(user);
    }

    /**
     * Manager creates Technician /
     * Dispatcher / Customer.
     */
    @Transactional
    public ManagedUserResponse createManagedUser(
            CreateUserRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new IllegalStateException(
                    "A user with this email already exists."
            );
        }

        validateManagedRole(
                request.getRole()
        );

        User user = new User();

        user.setName(
                request.getName().trim()
        );

        user.setEmail(email);

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

        user.setRole(
                request.getRole()
        );

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getTemporaryPassword()
                )
        );

        user.setActive(true);

        User savedUser =
                userRepository.save(user);

        return toManagedUserResponse(
                savedUser
        );
    }

    /**
     * Manager edits Technician /
     * Dispatcher / Customer.
     */
    @Transactional
    public ManagedUserResponse updateManagedUser(
            Long userId,
            UpdateManagedUserRequest request) {

        User user =
                findManagedUserById(userId);

        validateManagedRole(
                request.getRole()
        );

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        Optional<User> existingUser =
                userRepository.findByEmail(
                        email
                );

        if (existingUser.isPresent()
                && !existingUser
                        .get()
                        .getId()
                        .equals(user.getId())) {

            throw new IllegalStateException(
                    "A user with this email already exists."
            );
        }

        user.setName(
                request.getName().trim()
        );

        user.setEmail(email);

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

        user.setRole(
                request.getRole()
        );

        User savedUser =
                userRepository.save(user);

        return toManagedUserResponse(
                savedUser
        );
    }

    /**
     * Manager activates a user.
     */
    @Transactional
    public ManagedUserResponse activateManagedUser(
            Long userId) {

        User user =
                findManagedUserById(userId);

        user.setActive(true);

        User savedUser =
                userRepository.save(user);

        return toManagedUserResponse(
                savedUser
        );
    }

    /**
     * Manager deactivates a user.
     */
    @Transactional
    public ManagedUserResponse deactivateManagedUser(
            Long userId) {

        User user =
                findManagedUserById(userId);

        user.setActive(false);

        User savedUser =
                userRepository.save(user);

        return toManagedUserResponse(
                savedUser
        );
    }

    /**
     * Manager resets another user's password.
     */
    @Transactional
    public void resetManagedUserPassword(
            Long userId,
            ResetUserPasswordRequest request) {

        User user =
                findManagedUserById(userId);

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getTemporaryPassword()
                )
        );

        userRepository.save(user);
    }

    // =========================================================
    // TECHNICIAN WORKLOAD
    // =========================================================

    /**
     * Returns technician workload information
     * for Manager and Dispatcher.
     *
     * Active jobs:
     * ASSIGNED + IN_PROGRESS + ON_HOLD
     *
     * 0-2 = AVAILABLE
     * 3-4 = BUSY
     * 5+  = HEAVILY_LOADED
     */
    @Transactional(readOnly = true)
    public List<TechnicianWorkloadResponse>
            getTechnicianWorkloads() {

        List<User> technicians =
                userRepository.findByRole(
                        User.Role.TECHNICIAN
                );

        return technicians
                .stream()
                .map(technician -> {

                    long assignedJobs =
                            workOrderRepository
                                    .countByAssignedToIdAndStatus(
                                            technician.getId(),
                                            WorkOrder.Status.ASSIGNED
                                    );

                    long inProgressJobs =
                            workOrderRepository
                                    .countByAssignedToIdAndStatus(
                                            technician.getId(),
                                            WorkOrder.Status.IN_PROGRESS
                                    );

                    long onHoldJobs =
                            workOrderRepository
                                    .countByAssignedToIdAndStatus(
                                            technician.getId(),
                                            WorkOrder.Status.ON_HOLD
                                    );

                    long activeJobs =
                            assignedJobs
                                    + inProgressJobs
                                    + onHoldJobs;

                    String availabilityStatus;

                    if (activeJobs <= 2) {

                        availabilityStatus =
                                "AVAILABLE";

                    } else if (activeJobs <= 4) {

                        availabilityStatus =
                                "BUSY";

                    } else {

                        availabilityStatus =
                                "HEAVILY_LOADED";
                    }

                    return new TechnicianWorkloadResponse(
                            technician.getId(),
                            technician.getName(),
                            technician.getEmail(),
                            activeJobs,
                            availabilityStatus
                    );
                })
                .toList();
    }

    // =========================================================
    // PROFILE PHOTO VALIDATION
    // =========================================================

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

        if (!ALLOWED_EXTENSIONS.contains(
                extension.toLowerCase()
        )) {

            throw new IllegalArgumentException(
                    "Invalid image file extension."
            );
        }
    }

    // =========================================================
    // PROFILE PHOTO HELPERS
    // =========================================================

    /**
     * Cloudinary public ID used for each user's profile photo.
     *
     * Example:
     *
     * field-service-management/profile-photos/user-5
     *
     * Using a fixed public ID for each user means that uploading
     * a new photo automatically overwrites that user's previous
     * photo instead of creating unlimited old images.
     */
    private String buildProfilePhotoPublicId(
            Long userId) {

        return CLOUDINARY_PROFILE_FOLDER
                + "/user-"
                + userId;
    }

    /**
     * Checks whether the existing database value is already
     * a Cloudinary image URL.
     */
    private boolean isCloudinaryUrl(
            String value) {

        if (value == null) {
            return false;
        }

        return value.startsWith(
                "https://res.cloudinary.com/"
        )
                || value.startsWith(
                        "http://res.cloudinary.com/"
                );
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

    // =========================================================
    // USER HELPERS
    // =========================================================

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

    /**
     * Finds a user managed by Manager.
     * MANAGER accounts cannot be changed through
     * User Management.
     */
    private User findManagedUserById(
            Long userId) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );

        if (user.getRole()
                == User.Role.MANAGER) {

            throw new IllegalArgumentException(
                    "Manager accounts cannot be modified through User Management."
            );
        }

        return user;
    }

    /**
     * Only these roles can be managed from
     * Manager User Management.
     */
    private void validateManagedRole(
            User.Role role) {

        if (role == null) {

            throw new IllegalArgumentException(
                    "Role is required."
            );
        }

        if (role == User.Role.MANAGER) {

            throw new IllegalArgumentException(
                    "Creating or assigning the MANAGER role is not allowed through User Management."
            );
        }
    }

    // =========================================================
    // RESPONSE MAPPERS
    // =========================================================

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

    private ManagedUserResponse toManagedUserResponse(
            User user) {

        return new ManagedUserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getDepartment(),
                user.getProfilePhoto(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }

    // =========================================================
    // GENERAL HELPERS
    // =========================================================

    private String cleanOptional(
            String value) {

        if (value == null
                || value.isBlank()) {

            return null;
        }

        return value.trim();
    }
}