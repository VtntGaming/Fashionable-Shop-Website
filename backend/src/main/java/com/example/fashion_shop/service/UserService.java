package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.UserUpdateRequest;
import com.example.fashion_shop.dto.response.UserResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    /**
     * Get user by email
     */
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    /**
     * Update user profile
     */
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(user);
        log.info("User {} updated", id);
        return toUserResponse(updatedUser);
    }

    /**
     * Get all users (Admin)
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(this::toUserResponse);
    }

    /**
     * Update user status (Admin)
     */
    public UserResponse updateUserStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            user.setStatus(User.Status.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Must be ACTIVE or INACTIVE");
        }

        User updatedUser = userRepository.save(user);
        log.info("User {} status updated to {}", id, status);
        return toUserResponse(updatedUser);
    }

    /**
     * Delete user (Admin)
     */
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
        log.info("User {} deleted", id);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
