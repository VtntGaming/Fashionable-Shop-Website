package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.request.UserUpdateRequest;
import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.UserResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UserResponse profile = userService.getUserById(user.getId());
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User profile retrieved successfully")
                .data(profile)
                .build());
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User retrieved successfully")
                .data(user)
                .build());
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateRequest request) {
        User user = (User) authentication.getPrincipal();
        UserResponse updatedUser = userService.updateUser(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User profile updated successfully")
                .data(updatedUser)
                .build());
    }

    /**
     * Get all users (Admin only)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.<Page<UserResponse>>builder()
                .success(true)
                .message("Users retrieved successfully")
                .data(users)
                .build());
    }

    /**
     * Update user status (Admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        UserResponse user = userService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .success(true)
                .message("User status updated successfully")
                .data(user)
                .build());
    }

    /**
     * Delete user (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("User deleted successfully")
                .data("User has been removed")
                .build());
    }
}
