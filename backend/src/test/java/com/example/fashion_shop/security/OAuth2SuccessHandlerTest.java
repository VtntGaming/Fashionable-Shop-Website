package com.example.fashion_shop.security;

import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("OAuth2SuccessHandler - OAuth2 Success Handler Tests")
class OAuth2SuccessHandlerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private Authentication authentication;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @BeforeEach
    void setUp() throws Exception {
        oAuth2SuccessHandler = new OAuth2SuccessHandler(userRepository, jwtTokenProvider);
        // Default: redirect succeeds
        doNothing().when(response).sendRedirect(anyString());
    }

    private OAuth2User createOAuth2User(Map<String, Object> attributes) {
        return new DefaultOAuth2User(
                Collections.emptyList(),
                attributes,
                "sub"
        );
    }

    // ==================== New User Registration Tests ====================

    @Nested
    @DisplayName("New User Registration")
    class NewUserRegistrationTests {

        @Test
        @DisplayName("Should create new user for first-time Google login")
        void shouldCreateNewUserForFirstTimeLogin() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "google-user-123");
            attributes.put("email", "newuser@gmail.com");
            attributes.put("name", "New User");
            attributes.put("email_verified", true);

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("newuser@gmail.com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("newuser@gmail.com")).thenReturn("access_token_123");
            when(jwtTokenProvider.generateRefreshToken("newuser@gmail.com")).thenReturn("refresh_token_456");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertEquals("newuser@gmail.com", savedUser.getEmail());
            assertEquals("New User", savedUser.getFullName());
            assertEquals("google-user-123", savedUser.getGoogleId());
            assertEquals(User.Role.USER, savedUser.getRole());
            assertEquals(User.Status.ACTIVE, savedUser.getStatus());
        }

        @Test
        @DisplayName("Should generate JWT tokens for new user")
        void shouldGenerateJwtTokensForNewUser() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "google-user-456");
            attributes.put("email", "tokenstest@gmail.com");
            attributes.put("name", "Tokens Test");

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("tokenstest@gmail.com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("tokenstest@gmail.com")).thenReturn("new_access_token");
            when(jwtTokenProvider.generateRefreshToken("tokenstest@gmail.com")).thenReturn("new_refresh_token");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            verify(jwtTokenProvider).generateAccessToken("tokenstest@gmail.com");
            verify(jwtTokenProvider).generateRefreshToken("tokenstest@gmail.com");
        }

        @Test
        @DisplayName("Should set OAuthProvider to GOOGLE")
        void shouldSetOAuthProviderToGoogle() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "google-user-789");
            attributes.put("email", "provider@gmail.com");
            attributes.put("name", "Provider Test");

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("provider@gmail.com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("provider@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("provider@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(User.OAuthProvider.GOOGLE, userCaptor.getValue().getOauthProvider());
        }
    }

    // ==================== Existing User Login Tests ====================

    @Nested
    @DisplayName("Existing User Login")
    class ExistingUserLoginTests {

        @Test
        @DisplayName("Should find existing user by email")
        void shouldFindExistingUserByEmail() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "existing-google-id");
            attributes.put("email", "existing@gmail.com");
            attributes.put("name", "Existing User");

            User existingUser = User.builder()
                    .id(1L)
                    .email("existing@gmail.com")
                    .fullName("Existing User")
                    .googleId("existing-google-id")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("existing@gmail.com")).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateAccessToken("existing@gmail.com")).thenReturn("access_token");
            when(jwtTokenProvider.generateRefreshToken("existing@gmail.com")).thenReturn("refresh_token");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should update Google ID if existing user does not have one")
        void shouldUpdateGoogleIdIfMissing() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "google-id-update");
            attributes.put("email", "updateid@gmail.com");
            attributes.put("name", "Update ID");

            User existingUser = User.builder()
                    .id(2L)
                    .email("updateid@gmail.com")
                    .fullName("Update ID")
                    .googleId(null)
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("updateid@gmail.com")).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateAccessToken("updateid@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("updateid@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            // save is called twice: once for update (setGoogleId), once for the original user
            verify(userRepository, atLeast(1)).save(any(User.class));
        }

        @Test
        @DisplayName("Should not update Google ID if already set")
        void shouldNotUpdateGoogleIdIfAlreadySet() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "same-google-id");
            attributes.put("email", "samgid@gmail.com");
            attributes.put("name", "Same Google ID");

            User existingUser = User.builder()
                    .id(3L)
                    .email("samgid@gmail.com")
                    .fullName("Same Google ID")
                    .googleId("same-google-id")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("samgid@gmail.com")).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateAccessToken("samgid@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("samgid@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            verify(userRepository, never()).save(any(User.class));
        }

        @Test
        @DisplayName("Should update Google ID if empty string")
        void shouldUpdateGoogleIdIfEmpty() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "empty-google-id");
            attributes.put("email", "emptygid@gmail.com");
            attributes.put("name", "Empty Google ID");

            User existingUser = User.builder()
                    .id(4L)
                    .email("emptygid@gmail.com")
                    .fullName("Empty Google ID")
                    .googleId("")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("emptygid@gmail.com")).thenReturn(Optional.of(existingUser));
            when(jwtTokenProvider.generateAccessToken("emptygid@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("emptygid@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            verify(userRepository, atLeast(1)).save(any(User.class));
        }
    }

    // ==================== Edge Cases Tests ====================

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle user with empty name")
        void shouldHandleUserWithEmptyName() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "no-name-id");
            attributes.put("email", "noname@gmail.com");

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("noname@gmail.com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("noname@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("noname@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertNull(userCaptor.getValue().getFullName());
        }

        @Test
        @DisplayName("Should handle user with special characters in name")
        void shouldHandleSpecialCharactersInName() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "special-id");
            attributes.put("email", "special@gmail.com");
            attributes.put("name", "Nguyen Van An-Dang 'Tran'");

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("special@gmail.com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("special@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("special@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals("Nguyen Van An-Dang 'Tran'", userCaptor.getValue().getFullName());
        }

        @Test
        @DisplayName("Should handle email with different case")
        void shouldHandleDifferentEmailCase() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "case-id");
            attributes.put("email", "Test@Gmail.Com");
            attributes.put("name", "Case Test");

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("Test@Gmail.Com")).thenReturn(Optional.empty());
            when(jwtTokenProvider.generateAccessToken("Test@Gmail.Com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("Test@Gmail.Com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals("Test@Gmail.Com", userCaptor.getValue().getEmail());
        }
    }

    // ==================== Redirect URL Tests ====================

    @Nested
    @DisplayName("Redirect URL Construction")
    class RedirectUrlTests {

        @Test
        @DisplayName("Should redirect with all required parameters")
        void shouldRedirectWithAllRequiredParameters() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "redirect-id");
            attributes.put("email", "redirect@gmail.com");
            attributes.put("name", "Redirect Test");

            User user = User.builder()
                    .id(100L)
                    .email("redirect@gmail.com")
                    .fullName("Redirect Test")
                    .googleId("redirect-id")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("redirect@gmail.com")).thenReturn(Optional.of(user));
            when(jwtTokenProvider.generateAccessToken("redirect@gmail.com")).thenReturn("access_token_value");
            when(jwtTokenProvider.generateRefreshToken("redirect@gmail.com")).thenReturn("refresh_token_value");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            ArgumentCaptor<String> urlCaptor = ArgumentCaptor.forClass(String.class);
            verify(response).sendRedirect(urlCaptor.capture());

            String redirectUrl = urlCaptor.getValue();
            assertTrue(redirectUrl.startsWith("http://localhost:3000/oauth-success"));
            assertTrue(redirectUrl.contains("accessToken=access_token_value"));
            assertTrue(redirectUrl.contains("refreshToken=refresh_token_value"));
            assertTrue(redirectUrl.contains("userId=100"));
        }

        @Test
        @DisplayName("Should redirect to correct frontend endpoint")
        void shouldRedirectToCorrectEndpoint() throws Exception {
            Map<String, Object> attributes = new HashMap<>();
            attributes.put("sub", "endpoint-id");
            attributes.put("email", "endpoint@gmail.com");
            attributes.put("name", "Endpoint Test");

            User user = User.builder()
                    .id(200L)
                    .email("endpoint@gmail.com")
                    .fullName("Endpoint Test")
                    .googleId("endpoint-id")
                    .role(User.Role.USER)
                    .status(User.Status.ACTIVE)
                    .build();

            OAuth2User oauth2User = createOAuth2User(attributes);
            when(authentication.getPrincipal()).thenReturn(oauth2User);
            when(userRepository.findByEmail("endpoint@gmail.com")).thenReturn(Optional.of(user));
            when(jwtTokenProvider.generateAccessToken("endpoint@gmail.com")).thenReturn("token");
            when(jwtTokenProvider.generateRefreshToken("endpoint@gmail.com")).thenReturn("refresh");

            oAuth2SuccessHandler.onAuthenticationSuccess(request, response, authentication);

            verify(response).sendRedirect(argThat(url ->
                url.startsWith("http://localhost:3000/oauth-success")
            ));
        }
    }
}
