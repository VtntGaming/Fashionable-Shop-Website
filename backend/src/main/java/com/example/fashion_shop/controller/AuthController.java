package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.request.ForgotPasswordRequest;
import com.example.fashion_shop.dto.request.GoogleLoginRequest;
import com.example.fashion_shop.dto.request.LoginRequest;
import com.example.fashion_shop.dto.request.RefreshTokenRequest;
import com.example.fashion_shop.dto.request.RegisterRequest;
import com.example.fashion_shop.dto.request.ResetPasswordRequest;
import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.AuthResponse;
import com.example.fashion_shop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = authService.generateResetToken(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If the email exists, a reset link has been sent",
                Map.of("resetToken", resetToken)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {
        AuthResponse response = authService.googleLogin(
                request.getGoogleId(),
                request.getEmail(),
                request.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Google login successful", response));
    }
}
