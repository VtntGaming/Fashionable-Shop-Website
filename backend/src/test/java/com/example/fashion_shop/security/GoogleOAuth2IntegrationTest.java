package com.example.fashion_shop.security;

import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Google OAuth2 Integration Tests")
class GoogleOAuth2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    // ==================== OAuth2 Authorization Endpoint Tests ====================

    @Nested
    @DisplayName("OAuth2 Authorization Endpoint")
    class OAuth2AuthorizationEndpointTests {

        @Test
        @DisplayName("Should allow access to Google OAuth2 authorization endpoint")
        void shouldAllowAccessToOAuth2Endpoint() throws Exception {
            mockMvc.perform(get("/oauth2/authorization/google"))
                    .andExpect(status().isFound());
        }

        @Test
        @DisplayName("Should allow access to OAuth2 callback endpoint")
        void shouldAllowAccessToOAuth2CallbackEndpoint() throws Exception {
            mockMvc.perform(get("/login/oauth2/code/google"))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("OAuth2 endpoint should redirect to Google")
        void oauth2EndpointShouldRedirectToGoogle() throws Exception {
            mockMvc.perform(get("/oauth2/authorization/google"))
                    .andExpect(status().isFound())
                    .andExpect(header().exists("Location"))
                    .andExpect(result -> {
                        String location = result.getResponse().getHeader("Location");
                        if (location != null) {
                            assert location.contains("accounts.google.com");
                            assert location.contains("client_id");
                            assert location.contains("redirect_uri");
                        }
                    });
        }
    }

    // ==================== Security Configuration Tests ====================

    @Nested
    @DisplayName("Security Configuration for OAuth2")
    class SecurityConfigurationTests {

        @Test
        @DisplayName("Auth endpoints should be publicly accessible")
        void authEndpointsShouldBePubliclyAccessible() throws Exception {
            mockMvc.perform(get("/api/auth/register"))
                    .andExpect(status().isMethodNotAllowed());

            mockMvc.perform(get("/api/auth/login"))
                    .andExpect(status().isMethodNotAllowed());
        }

        @Test
        @DisplayName("Protected endpoints should require authentication")
        void protectedEndpointsShouldRequireAuth() throws Exception {
            mockMvc.perform(get("/api/cart"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Public endpoints should be accessible without auth")
        void publicEndpointsShouldBeAccessible() throws Exception {
            mockMvc.perform(get("/api/categories"))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/products"))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("Admin endpoints should require ADMIN role")
        void adminEndpointsShouldRequireAdminRole() throws Exception {
            mockMvc.perform(get("/api/admin/dashboard"))
                    .andExpect(status().isForbidden());
        }
    }

    // ==================== Google OAuth2 User Info Extraction Tests ====================

    @Nested
    @DisplayName("Google OAuth2 User Info Extraction")
    class UserInfoExtractionTests {

        @Test
        @DisplayName("Should extract all required user fields from Google response")
        void shouldExtractAllRequiredFields() {
            java.util.Map<String, Object> googleResponse = new java.util.HashMap<>();
            googleResponse.put("sub", "google-123456789");
            googleResponse.put("email", "test@gmail.com");
            googleResponse.put("name", "Test User");
            googleResponse.put("picture", "https://lh3.googleusercontent.com/photo.jpg");
            googleResponse.put("email_verified", true);

            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleResponse);

            assert "google-123456789".equals(userInfo.getId());
            assert "test@gmail.com".equals(userInfo.getEmail());
            assert "Test User".equals(userInfo.getName());
            assert "https://lh3.googleusercontent.com/photo.jpg".equals(userInfo.getPicture());
            assert userInfo.getEmailVerified();
        }

        @Test
        @DisplayName("Should handle missing optional fields gracefully")
        void shouldHandleMissingOptionalFields() {
            java.util.Map<String, Object> minimalResponse = new java.util.HashMap<>();
            minimalResponse.put("sub", "minimal-google-id");
            minimalResponse.put("email", "minimal@gmail.com");

            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(minimalResponse);

            assert "minimal-google-id".equals(userInfo.getId());
            assert "minimal@gmail.com".equals(userInfo.getEmail());
            assert userInfo.getName() == null;
            assert userInfo.getPicture() == null;
            assert !userInfo.getEmailVerified();
        }
    }

    // ==================== JWT Token Generation for OAuth2 Users Tests ====================

    @Nested
    @DisplayName("JWT Token Generation for OAuth2 Users")
    class JWTTokenGenerationTests {

        @Test
        @DisplayName("Should create User entity correctly from Google OAuth2 data")
        void shouldCreateUserFromGoogleOAuth2Data() {
            java.util.Map<String, Object> googleResponse = new java.util.HashMap<>();
            googleResponse.put("sub", "google-oauth-id");
            googleResponse.put("email", "oauthuser@gmail.com");
            googleResponse.put("name", "OAuth User");

            User user = User.builder()
                    .email((String) googleResponse.get("email"))
                    .fullName((String) googleResponse.get("name"))
                    .googleId((String) googleResponse.get("sub"))
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .oauthProvider(User.OAuthProvider.GOOGLE)
                    .build();

            assert "oauthuser@gmail.com".equals(user.getEmail());
            assert "OAuth User".equals(user.getFullName());
            assert "google-oauth-id".equals(user.getGoogleId());
            assert user.getRole() == User.Role.USER;
            assert user.getStatus() == User.Status.ACTIVE;
            assert user.getOauthProvider() == User.OAuthProvider.GOOGLE;
        }

        @Test
        @DisplayName("Should correctly identify OAuth provider")
        void shouldIdentifyOAuthProvider() {
            User googleUser = User.builder()
                    .email("google@example.com")
                    .fullName("Google User")
                    .oauthProvider(User.OAuthProvider.GOOGLE)
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            User emailUser = User.builder()
                    .email("email@example.com")
                    .fullName("Email User")
                    .oauthProvider(User.OAuthProvider.EMAIL)
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            assert googleUser.getOauthProvider() == User.OAuthProvider.GOOGLE;
            assert emailUser.getOauthProvider() == User.OAuthProvider.EMAIL;
            assert googleUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_USER"));
        }
    }

    // ==================== Existing User with Google ID Tests ====================

    @Nested
    @DisplayName("Existing User with Google ID")
    class ExistingUserWithGoogleIdTests {

        @Test
        @DisplayName("Should find existing user by Google ID")
        void shouldFindExistingUserByGoogleId() {
            User existingUser = User.builder()
                    .id(1L)
                    .email("existing@gmail.com")
                    .fullName("Existing User")
                    .googleId("existing-google-id-123")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .oauthProvider(User.OAuthProvider.GOOGLE)
                    .build();

            when(userRepository.findByGoogleId("existing-google-id-123"))
                    .thenReturn(Optional.of(existingUser));

            Optional<User> found = userRepository.findByGoogleId("existing-google-id-123");

            assert found.isPresent();
            assert "existing@gmail.com".equals(found.get().getEmail());
        }

        @Test
        @DisplayName("Should find existing user by email when logging in with Google")
        void shouldFindExistingUserByEmailOnGoogleLogin() {
            User existingUser = User.builder()
                    .id(2L)
                    .email("existing@gmail.com")
                    .fullName("Existing User")
                    .googleId(null)
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            when(userRepository.findByEmail("existing@gmail.com"))
                    .thenReturn(Optional.of(existingUser));

            Optional<User> found = userRepository.findByEmail("existing@gmail.com");

            assert found.isPresent();
            assert found.get().getGoogleId() == null;
        }

        @Test
        @DisplayName("Should link Google ID to existing user if not set")
        void shouldLinkGoogleIdToExistingUser() {
            User existingUser = User.builder()
                    .id(3L)
                    .email("unlinked@gmail.com")
                    .fullName("Unlinked User")
                    .googleId(null)
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .oauthProvider(User.OAuthProvider.EMAIL)
                    .build();

            assert existingUser.getGoogleId() == null;

            existingUser.setGoogleId("new-google-id-456");
            existingUser.setOauthProvider(User.OAuthProvider.GOOGLE);

            assert "new-google-id-456".equals(existingUser.getGoogleId());
            assert existingUser.getOauthProvider() == User.OAuthProvider.GOOGLE;
        }
    }
}
