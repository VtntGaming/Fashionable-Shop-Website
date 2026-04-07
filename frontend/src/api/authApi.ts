import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    axiosInstance.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  refreshToken: (refreshToken: string) =>
    axiosInstance.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    axiosInstance.post<{ resetToken: string }>('/auth/forgot-password', data).then((r) => r.data),

  resetPassword: (data: ResetPasswordRequest) =>
    axiosInstance.post('/auth/reset-password', data).then((r) => r.data),

  googleLogin: (data: { googleId: string; email: string; fullName: string }) =>
    axiosInstance.post<AuthResponse>('/auth/google', data).then((r) => r.data),
};
