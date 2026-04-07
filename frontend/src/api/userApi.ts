import axiosInstance from './axiosInstance';
import type { User } from '@/types/user';
import type { PaginatedResponse } from '@/types/api';

export const userApi = {
  getProfile: () =>
    axiosInstance.get<User>('/users/profile').then((r) => r.data),

  updateProfile: (data: { fullName?: string; phone?: string; address?: string }) =>
    axiosInstance.put<User>('/users/profile', data).then((r) => r.data),

  getUsers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<User>>('/users', { params }).then((r) => r.data),

  updateUserStatus: (id: number, status: 'ACTIVE' | 'INACTIVE') =>
    axiosInstance.put<User>(`/users/${id}/status`, null, { params: { status } }).then((r) => r.data),

  deleteUser: (id: number) =>
    axiosInstance.delete(`/users/${id}`).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.put('/users/change-password', data).then((r) => r.data),
};
