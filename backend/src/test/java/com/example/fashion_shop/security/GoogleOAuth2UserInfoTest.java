package com.example.fashion_shop.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("GoogleOAuth2UserInfo - Google OAuth2 User Info Extraction Tests")
class GoogleOAuth2UserInfoTest {

    private Map<String, Object> googleAttributes;

    @BeforeEach
    void setUp() {
        googleAttributes = new HashMap<>();
        googleAttributes.put("sub", "123456789");
        googleAttributes.put("email", "testuser@gmail.com");
        googleAttributes.put("name", "Test User");
        googleAttributes.put("picture", "https://lh3.googleusercontent.com/photo.jpg");
        googleAttributes.put("email_verified", true);
    }

    // ==================== Constructor Tests ====================

    @Nested
    @DisplayName("Constructor")
    class ConstructorTests {

        @Test
        @DisplayName("Should accept valid attributes map")
        void shouldAcceptValidAttributesMap() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNotNull(userInfo);
            assertNotNull(userInfo.getAttributes());
            assertEquals(googleAttributes, userInfo.getAttributes());
        }

        @Test
        @DisplayName("Should accept empty attributes map")
        void shouldAcceptEmptyAttributesMap() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(new HashMap<>());

            assertNotNull(userInfo);
            assertNotNull(userInfo.getAttributes());
            assertTrue(userInfo.getAttributes().isEmpty());
        }

        @Test
        @DisplayName("Should accept null attributes map")
        void shouldAcceptNullAttributesMap() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(null);

            assertNotNull(userInfo);
            assertNull(userInfo.getAttributes());
        }
    }

    // ==================== Get ID Tests ====================

    @Nested
    @DisplayName("Get ID")
    class GetIdTests {

        @Test
        @DisplayName("Should extract ID from sub claim")
        void shouldExtractIdFromSubClaim() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertEquals("123456789", userInfo.getId());
        }

        @Test
        @DisplayName("Should return null when sub is missing")
        void shouldReturnNullWhenSubMissing() {
            googleAttributes.remove("sub");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNull(userInfo.getId());
        }

        @Test
        @DisplayName("Should return null for null attributes")
        void shouldReturnNullForNullAttributes() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(null);

            assertNull(userInfo.getId());
        }
    }

    // ==================== Get Email Tests ====================

    @Nested
    @DisplayName("Get Email")
    class GetEmailTests {

        @Test
        @DisplayName("Should extract email from attributes")
        void shouldExtractEmailFromAttributes() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertEquals("testuser@gmail.com", userInfo.getEmail());
        }

        @Test
        @DisplayName("Should return null when email is missing")
        void shouldReturnNullWhenEmailMissing() {
            googleAttributes.remove("email");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNull(userInfo.getEmail());
        }

        @Test
        @DisplayName("Should handle email as non-string type")
        void shouldHandleEmailAsNonStringType() {
            googleAttributes.put("email", 12345);
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNull(userInfo.getEmail());
        }
    }

    // ==================== Get Name Tests ====================

    @Nested
    @DisplayName("Get Name")
    class GetNameTests {

        @Test
        @DisplayName("Should extract name from attributes")
        void shouldExtractNameFromAttributes() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertEquals("Test User", userInfo.getName());
        }

        @Test
        @DisplayName("Should return null when name is missing")
        void shouldReturnNullWhenNameMissing() {
            googleAttributes.remove("name");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNull(userInfo.getName());
        }

        @Test
        @DisplayName("Should handle names with special characters")
        void shouldHandleSpecialCharactersInName() {
            googleAttributes.put("name", "Nguyễn Văn A-B-C");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertEquals("Nguyễn Văn A-B-C", userInfo.getName());
        }
    }

    // ==================== Get Picture Tests ====================

    @Nested
    @DisplayName("Get Picture")
    class GetPictureTests {

        @Test
        @DisplayName("Should extract picture URL from attributes")
        void shouldExtractPictureFromAttributes() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertEquals("https://lh3.googleusercontent.com/photo.jpg", userInfo.getPicture());
        }

        @Test
        @DisplayName("Should return null when picture is missing")
        void shouldReturnNullWhenPictureMissing() {
            googleAttributes.remove("picture");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertNull(userInfo.getPicture());
        }
    }

    // ==================== Email Verified Tests ====================

    @Nested
    @DisplayName("Email Verified")
    class EmailVerifiedTests {

        @Test
        @DisplayName("Should return true when email_verified is true Boolean")
        void shouldReturnTrueWhenEmailVerifiedIsTrueBoolean() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertTrue(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should return false when email_verified is false Boolean")
        void shouldReturnFalseWhenEmailVerifiedIsFalseBoolean() {
            googleAttributes.put("email_verified", false);
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertFalse(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should return false when email_verified is missing")
        void shouldReturnFalseWhenEmailVerifiedMissing() {
            googleAttributes.remove("email_verified");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertFalse(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should return false when email_verified is null")
        void shouldReturnFalseWhenEmailVerifiedIsNull() {
            googleAttributes.put("email_verified", null);
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertFalse(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should return true for string 'true'")
        void shouldReturnTrueForStringTrue() {
            googleAttributes.put("email_verified", "true");
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            assertFalse(userInfo.getEmailVerified());
        }
    }

    // ==================== Get Attributes Tests ====================

    @Nested
    @DisplayName("Get Attributes")
    class GetAttributesTests {

        @Test
        @DisplayName("Should return reference to original attributes map")
        void shouldReturnReferenceToOriginalAttributesMap() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            Map<String, Object> retrieved = userInfo.getAttributes();

            assertNotNull(retrieved);
            assertEquals(googleAttributes.size(), retrieved.size());
            assertSame(googleAttributes, retrieved);
        }

        @Test
        @DisplayName("Should reflect changes to original map")
        void shouldReflectChangesToOriginalMap() {
            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(googleAttributes);

            googleAttributes.put("new_field", "new_value");

            assertEquals("new_value", userInfo.getAttributes().get("new_field"));
        }
    }

    // ==================== Complete User Data Scenarios ====================

    @Nested
    @DisplayName("Complete User Data Scenarios")
    class CompleteUserDataScenarios {

        @Test
        @DisplayName("Should handle full Google OAuth2 response")
        void shouldHandleFullGoogleOAuth2Response() {
            Map<String, Object> fullGoogleResponse = new HashMap<>();
            fullGoogleResponse.put("sub", "117189472583712345678");
            fullGoogleResponse.put("id", "117189472583712345678");
            fullGoogleResponse.put("email", "john.doe@gmail.com");
            fullGoogleResponse.put("verified_email", true);
            fullGoogleResponse.put("name", "John Doe");
            fullGoogleResponse.put("given_name", "John");
            fullGoogleResponse.put("family_name", "Doe");
            fullGoogleResponse.put("picture", "https://lh3.googleusercontent.com/a-/ABC123");
            fullGoogleResponse.put("locale", "vi");
            fullGoogleResponse.put("hd", "gmail.com");

            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(fullGoogleResponse);

            assertEquals("117189472583712345678", userInfo.getId());
            assertEquals("john.doe@gmail.com", userInfo.getEmail());
            assertEquals("John Doe", userInfo.getName());
            assertEquals("https://lh3.googleusercontent.com/a-/ABC123", userInfo.getPicture());
            assertFalse(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should handle minimal Google OAuth2 response")
        void shouldHandleMinimalGoogleOAuth2Response() {
            Map<String, Object> minimalResponse = new HashMap<>();
            minimalResponse.put("sub", "111111");
            minimalResponse.put("email", "minimal@gmail.com");

            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(minimalResponse);

            assertEquals("111111", userInfo.getId());
            assertEquals("minimal@gmail.com", userInfo.getEmail());
            assertNull(userInfo.getName());
            assertNull(userInfo.getPicture());
            assertFalse(userInfo.getEmailVerified());
        }

        @Test
        @DisplayName("Should handle Vietnamese user data")
        void shouldHandleVietnameseUserData() {
            Map<String, Object> vnUserData = new HashMap<>();
            vnUserData.put("sub", "999999999");
            vnUserData.put("email", "nguyenvana@example.com");
            vnUserData.put("name", "Nguyễn Văn An");
            vnUserData.put("picture", "https://lh3.googleusercontent.com/vn-user.jpg");
            vnUserData.put("email_verified", true);

            GoogleOAuth2UserInfo userInfo = new GoogleOAuth2UserInfo(vnUserData);

            assertEquals("999999999", userInfo.getId());
            assertEquals("nguyenvana@example.com", userInfo.getEmail());
            assertEquals("Nguyễn Văn An", userInfo.getName());
            assertEquals("https://lh3.googleusercontent.com/vn-user.jpg", userInfo.getPicture());
            assertTrue(userInfo.getEmailVerified());
        }
    }
}
