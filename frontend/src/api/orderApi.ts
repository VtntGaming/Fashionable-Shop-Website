import axiosInstance from './axiosInstance';
import type { OrderResponse, CreateOrderRequest } from '@/types/order';
import type { PaginatedResponse } from '@/types/api';

export const orderApi = {
  createOrder: (data: CreateOrderRequest) =>
    axiosInstance.post<OrderResponse>('/orders', data).then((r) => r.data),

  getOrder: (orderId: number) =>
    axiosInstance.get<OrderResponse>(`/orders/${orderId}`).then((r) => r.data),

  getOrderByCode: (orderCode: string) =>
    axiosInstance.get<OrderResponse>(`/orders/code/${orderCode}`).then((r) => r.data),

  getMyOrders: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<OrderResponse>>('/orders/my-orders', { params }).then((r) => r.data),

  cancelOrder: (orderId: number) =>
    axiosInstance.put<OrderResponse>(`/orders/${orderId}/cancel`).then((r) => r.data),

  updateOrderStatus: (orderId: number, status: string) =>
    axiosInstance.put<OrderResponse>(`/orders/${orderId}/status`, null, { params: { status } }).then((r) => r.data),

  getAllOrders: (params?: { page?: number; size?: number; status?: string }) =>
    axiosInstance.get<PaginatedResponse<OrderResponse>>('/orders', { params }).then((r) => r.data),

  getOrderById: (id: number) =>
    axiosInstance.get<OrderResponse>(`/orders/${id}`).then((r) => r.data),
};
