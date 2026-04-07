package com.example.fashion_shop.security;

import java.util.Map;

/**
 * Helper class to extract user information from Google OAuth2 response
 */
public class GoogleOAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public String getId() {
        if (attributes == null) return null;
        return (String) attributes.get("sub");
    }

    public String getEmail() {
        if (attributes == null) return null;
        Object v = attributes.get("email");
        return (v instanceof String) ? (String) v : null;
    }

    public String getName() {
        if (attributes == null) return null;
        return (String) attributes.get("name");
    }

    public String getPicture() {
        if (attributes == null) return null;
        return (String) attributes.get("picture");
    }

    public boolean getEmailVerified() {
        if (attributes == null) return false;
        Object verified = attributes.get("email_verified");
        return verified != null && verified instanceof Boolean && (Boolean) verified;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }
}
