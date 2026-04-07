import axiosInstance from './axiosInstance';
import type { FileUploadResponse } from '@/types/payment';

export const fileApi = {
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<FileUploadResponse>('/files/products/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  uploadProductImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return axiosInstance.post<FileUploadResponse[]>('/files/products/images/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post<FileUploadResponse>('/files/avatars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  deleteFile: (fileUrl: string) =>
    axiosInstance.delete('/files', { params: { fileUrl } }).then((r) => r.data),
};
