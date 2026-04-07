# Google OAuth2 Login Integration Guide

## Overview
This guide explains how to set up and use Google OAuth2 authentication in the Fashion Shop backend.

## Setup Instructions

### 1. **Get Google OAuth2 Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or use an existing one
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add Authorized Redirect URIs:
   - For development: `http://localhost:8080/login/oauth2/code/google`
   - For production: `https://yourdomain.com/login/oauth2/code/google`
7. Copy **Client ID** and **Client Secret**

### 2. **Configure in application.properties**

Replace the placeholders in `src/main/resources/application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

## API Endpoints

### OAuth2 Flow (Recommended for web/mobile)

**Automatic flow via Spring Security:**
```
GET /login/oauth2/authorization/google
```
After user approves, Spring Security automatically:
- Exchanges auth code for access token
- Calls OAuth2SuccessHandler
- Redirects to frontend with JWT tokens

**Frontend receives redirect:**
```
http://localhost:3000/oauth-success?accessToken=...&refreshToken=...&userId=...&email=...
```

---

### Manual Login Endpoint (Alternative)

**Endpoint:** `POST /api/auth/google`

**Request Body:**
```json
{
  "googleId": "123456789",
  "email": "user@gmail.com",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600000,
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "fullName": "John Doe"
    }
  }
}
```

---

## Implementation Details

### Files Created/Modified

1. **GoogleOAuth2UserInfo.java** - Helper to extract user info from Google's response
2. **OAuth2SuccessHandler.java** - Handles successful OAuth2 authentication
3. **OAuth2Config.java** - OAuth2 configuration (optional programmatic config)
4. **GoogleLoginRequest.java** - DTO for manual Google login endpoint
5. **AuthService.java** - Added `googleLogin()` method
6. **AuthController.java** - Added `POST /api/auth/google` endpoint
7. **SecurityConfig.java** - Enabled OAuth2 login with custom success handler
8. **application.properties** - Added Google OAuth2 configuration

### How It Works

1. **User initiates Google login** on frontend
2. **Frontend redirects to** `/login/oauth2/authorization/google`
3. **Spring Security intercepts** and redirects to Google login page
4. **User authenticates** with Google
5. **Google redirects back** with authorization code
6. **Spring Security exchanges** code for access token
7. **OAuth2SuccessHandler runs:**
   - Extracts user info from Google's response
   - Creates or updates user in database
   - Generates JWT tokens
   - Redirects to frontend with tokens
8. **Frontend stores** JWT tokens in localStorage/cookies

---

## Frontend Integration

### Using automatic OAuth2 flow:

```javascript
// Google OAuth2 Login Button
const handleGoogleLogin = () => {
  // Redirect to Spring backend OAuth2 endpoint
  window.location.href = 'http://localhost:8080/login/oauth2/authorization/google';
};

// Handle redirect (in OAuth success page)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
}, []);
```

### Using manual API endpoint:

```javascript
// After receiving Google token from google-login-button
const handleGoogleSuccess = async (response) => {
  try {
    const res = await fetch('http://localhost:8080/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googleId: response.credential.sub,
        email: response.credential.email,
        fullName: response.credential.name
      })
    });
    
    const data = await res.json();
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  } catch (error) {
    console.error('Login failed', error);
  }
};
```

---

## Database Schema

When a user logs in via Google, the system creates/updates a user record:

```sql
INSERT INTO users (
  email, 
  full_name, 
  google_id, 
  role, 
  status, 
  created_at
) VALUES (
  'user@gmail.com',
  'John Doe',
  '123456789',
  'USER',
  'ACTIVE',
  NOW()
);
```

---

## Security Considerations

1. **JWT Tokens**: 
   - Access token valid for 1 hour
   - Refresh token valid for 7 days
   - Secure storage required

2. **HTTPS**: 
   - Required for production
   - Protects tokens in transit

3. **Google ClientSecret**: 
   - Never expose to frontend
   - Store securely in environment variables

4. **CORS**: 
   - Configured to allow cross-origin requests
   - Restrict to specific domains in production

---

## Troubleshooting

### Issue: "Invalid Client ID"
- Verify Client ID in application.properties matches Google Console
- Check redirect URI matches exactly

### Issue: "Unauthorized" after login
- Ensure redirect URI is registered in Google Cloud Console
- Check application.properties has both client-id and client-secret

### Issue: CORS errors
- Frontend domain should be whitelisted in SecurityConfig
- Update corsConfigurationSource() if needed

### Issue: JWT token issues
- Verify jwt.secret in application.properties is set
- Check token expiration settings

---

## Testing

### Test OAuth2 Login Flow

1. Start backend: `mvn spring-boot:run`
2. In browser, navigate to: `http://localhost:8080/login/oauth2/authorization/google`
3. Grant permissions to app
4. Should be redirected to frontend with tokens in URL

### Test Manual API Endpoint

```bash
curl -X POST http://localhost:8080/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "123456789",
    "email": "test@gmail.com",
    "fullName": "Test User"
  }'
```

---

## Next Steps

1. **Frontend**: Implement Google login button using `@react-oauth/google` package
2. **Mobile**: Use Google Sign-In SDK for Android/iOS
3. **Additional OAuth**: Similar steps for GitHub, Facebook, etc.
