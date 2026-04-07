import axiosInstance from './axiosInstance';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const categoryApi = {
  getCategories: () =>
    axiosInstance.get<Category[]>('/categories').then((r) => r.data),

  getCategory: (id: number) =>
    axiosInstance.get<Category>(`/categories/${id}`).then((r) => r.data),

  getCategoryBySlug: (slug: string) =>
    axiosInstance.get<Category>(`/categories/slug/${slug}`).then((r) => r.data),

  getSubcategories: (parentId: number) =>
    axiosInstance.get<Category[]>(`/categories/${parentId}/children`).then((r) => r.data),

  createCategory: (data: CreateCategoryRequest) =>
    axiosInstance.post<Category>('/categories', data).then((r) => r.data),

  updateCategory: (id: number, data: UpdateCategoryRequest) =>
    axiosInstance.put<Category>(`/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: number) =>
    axiosInstance.delete(`/categories/${id}`).then((r) => r.data),
};
