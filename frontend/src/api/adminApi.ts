import axiosInstance from './axiosInstance';
import type { DashboardResponse } from '@/types/payment';

export const adminApi = {
  getDashboard: () =>
    axiosInstance.get<DashboardResponse>('/admin/dashboard').then((r) => r.data),

  getRevenueReport: () =>
    axiosInstance.get('/admin/reports/revenue').then((r) => r.data),

  getProductReport: () =>
    axiosInstance.get('/admin/reports/products').then((r) => r.data),

  getUserReport: () =>
    axiosInstance.get('/admin/reports/users').then((r) => r.data),

  getOrderReport: () =>
    axiosInstance.get('/admin/reports/orders').then((r) => r.data),
};
