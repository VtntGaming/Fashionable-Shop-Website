import axiosInstance from './axiosInstance';
import type { Product, ProductFilter, CreateProductRequest, UpdateProductRequest, ProductRecommendation } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export const productApi = {
  getProducts: (params: ProductFilter) =>
    axiosInstance.get<PaginatedResponse<Product>>('/products', { params }).then((r) => r.data),

  getProduct: (id: number) =>
    axiosInstance.get<Product>(`/products/${id}`).then((r) => r.data),

  getProductBySlug: (slug: string) =>
    axiosInstance.get<Product>(`/products/slug/${slug}`).then((r) => r.data),

  searchProducts: (params: { q: string; page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Product>>('/products/search', { params }).then((r) => r.data),

  getFeaturedProducts: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Product>>('/products/featured', { params }).then((r) => r.data),

  createProduct: (data: CreateProductRequest) =>
    axiosInstance.post<Product>('/products', data).then((r) => r.data),

  updateProduct: (id: number, data: UpdateProductRequest) =>
    axiosInstance.put<Product>(`/products/${id}`, data).then((r) => r.data),

  deleteProduct: (id: number) =>
    axiosInstance.delete(`/products/${id}`).then((r) => r.data),
};

export const recommendationApi = {
  getPersonalized: (limit?: number) =>
    axiosInstance.get<ProductRecommendation[]>('/recommendations/personalized', { params: { limit } }).then((r) => r.data),

  getGuestRecommendations: (limit?: number) =>
    axiosInstance.get<ProductRecommendation[]>('/recommendations/guest', { params: { limit } }).then((r) => r.data),

  getSimilarProducts: (productId: number, limit?: number) =>
    axiosInstance.get<ProductRecommendation[]>(`/recommendations/similar/${productId}`, { params: { limit } }).then((r) => r.data),

  getTrending: (limit?: number) =>
    axiosInstance.get<ProductRecommendation[]>('/recommendations/trending', { params: { limit } }).then((r) => r.data),
};
