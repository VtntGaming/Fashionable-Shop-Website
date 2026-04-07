import axiosInstance from './axiosInstance';
import type { Review, CreateReviewRequest, UpdateReviewRequest } from '@/types/review';
import type { PaginatedResponse } from '@/types/api';

export const reviewApi = {
  getProductReviews: (productId: number, params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Review>>(`/reviews/product/${productId}`, { params }).then((r) => r.data),

  getProductRating: (productId: number) =>
    axiosInstance.get<number>(`/reviews/product/${productId}/rating`).then((r) => r.data),

  getProductReviewCount: (productId: number) =>
    axiosInstance.get<number>(`/reviews/product/${productId}/count`).then((r) => r.data),

  getMyReviews: () =>
    axiosInstance.get<Review[]>('/reviews/my-reviews').then((r) => r.data),

  createReview: (data: CreateReviewRequest) =>
    axiosInstance.post<Review>('/reviews', data).then((r) => r.data),

  updateReview: (id: number, data: UpdateReviewRequest) =>
    axiosInstance.put<Review>(`/reviews/${id}`, data).then((r) => r.data),

  deleteReview: (id: number) =>
    axiosInstance.delete(`/reviews/${id}`).then((r) => r.data),

  updateReviewStatus: (id: number, status: 'VISIBLE' | 'HIDDEN') =>
    axiosInstance.put<Review>(`/reviews/${id}/status`, null, { params: { status } }).then((r) => r.data),

  getAllReviews: (params?: { page?: number; size?: number; status?: string }) =>
    axiosInstance.get<PaginatedResponse<Review>>('/reviews', { params }).then((r) => r.data),
};
