package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.LoginRequest;
import com.example.fashion_shop.dto.request.RefreshTokenRequest;
import com.example.fashion_shop.dto.request.RegisterRequest;
import com.example.fashion_shop.dto.request.ResetPasswordRequest;
import com.example.fashion_shop.dto.response.AuthResponse;
import com.example.fashion_shop.dto.response.UserResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.EmailAlreadyExistsException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.UserRepository;
import com.example.fashion_shop.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.Role.USER)
                .status(User.Status.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        emailService.sendWelcomeEmail(user);

        return generateAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        log.info("User logged in: {}", user.getEmail());

        return generateAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return generateAuthResponse(user);
    }

    public String generateResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String resetToken = jwtTokenProvider.generateAccessToken(email);
        user.setResetToken(resetToken);
        userRepository.save(user);

        log.info("Reset token generated for: {}", email);
        return resetToken;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        if (!jwtTokenProvider.validateToken(request.getToken())) {
            throw new BadRequestException("Invalid or expired reset token");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        log.info("Password reset successful for: {}", user.getEmail());
    }

    @Transactional
    public AuthResponse googleLogin(String googleId, String email, String fullName) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create new user if doesn't exist
                    User newUser = User.builder()
                            .email(email)
                            .fullName(fullName)
                            .googleId(googleId)
                            .role(User.Role.USER)
                            .status(User.Status.ACTIVE)
                            .build();
                    return userRepository.save(newUser);
                });

        // Update Google ID if not already set
        if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
            user.setGoogleId(googleId);
            userRepository.save(user);
        }

        log.info("User logged in via Google: {}", email);
        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthResponse.of(
                accessToken,
                refreshToken,
                jwtTokenProvider.getJwtExpiration(),
                UserResponse.fromEntity(user));
    }
}
