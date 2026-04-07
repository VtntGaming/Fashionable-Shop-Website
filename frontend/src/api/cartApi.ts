import axiosInstance from './axiosInstance';
import type { CartResponse, AddToCartRequest, UpdateCartRequest } from '@/types/cart';

export const cartApi = {
  getCart: () =>
    axiosInstance.get<CartResponse>('/carts').then((r) => r.data),

  addToCart: (data: AddToCartRequest) =>
    axiosInstance.post<CartResponse>('/carts/add', data).then((r) => r.data),

  updateCartItem: (data: UpdateCartRequest) =>
    axiosInstance.put<CartResponse>('/carts/update', data).then((r) => r.data),

  removeCartItem: (cartItemId: number) =>
    axiosInstance.delete<CartResponse>(`/carts/remove/${cartItemId}`).then((r) => r.data),

  clearCart: () =>
    axiosInstance.delete('/carts/clear').then((r) => r.data),
};
