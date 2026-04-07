import axiosInstance from './axiosInstance';
import type { WishlistItem } from '@/types/payment';

export const wishlistApi = {
  getWishlist: () =>
    axiosInstance.get<WishlistItem[]>('/wishlists').then((r) => r.data),

  checkWishlist: (productId: number) =>
    axiosInstance.get<boolean>(`/wishlists/check/${productId}`).then((r) => r.data),

  getWishlistCount: () =>
    axiosInstance.get<number>('/wishlists/count').then((r) => r.data),

  addToWishlist: (productId: number) =>
    axiosInstance.post(`/wishlists/${productId}`).then((r) => r.data),

  removeFromWishlist: (productId: number) =>
    axiosInstance.delete(`/wishlists/${productId}`).then((r) => r.data),

  clearWishlist: () =>
    axiosInstance.delete('/wishlists').then((r) => r.data),
};
