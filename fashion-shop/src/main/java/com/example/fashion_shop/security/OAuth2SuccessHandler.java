package com.example.fashion_shop.security;

import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * Handles successful OAuth2 authentication
 * Creates or updates user and redirects with JWT tokens
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(oAuth2User.getAttributes());
        
        // Create or update user
        User user = userRepository.findByEmail(userInfo.getEmail())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(userInfo.getEmail())
                            .fullName(userInfo.getName())
                            .googleId(userInfo.getId())
                            .role(User.Role.USER)
                            .status(User.Status.ACTIVE)
                            .build();
                    return userRepository.save(newUser);
                });

        // Update Google ID if not already set
        if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
            user.setGoogleId(userInfo.getId());
            userRepository.save(user);
        }

        // Generate JWT tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        log.info("User logged in via Google: {} ({})", user.getEmail(), user.getId());

        // Redirect to frontend with tokens
        String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/oauth-success")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("userId", user.getId())
                .queryParam("email", user.getEmail())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
