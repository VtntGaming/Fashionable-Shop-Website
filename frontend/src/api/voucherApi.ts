import axiosInstance from './axiosInstance';
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/types/voucher';
import type { PaginatedResponse } from '@/types/api';

export const voucherApi = {
  getVouchers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Voucher>>('/vouchers', { params }).then((r) => r.data),

  getVoucherByCode: (code: string) =>
    axiosInstance.get<Voucher>(`/vouchers/${code}`).then((r) => r.data),

  validateVoucher: (data: { code: string; orderAmount: number }) =>
    axiosInstance.post<{ discountAmount: number }>('/vouchers/validate', data).then((r) => r.data),

  getAllVouchers: () =>
    axiosInstance.get<Voucher[]>('/vouchers/admin/all').then((r) => r.data),

  createVoucher: (data: CreateVoucherRequest) =>
    axiosInstance.post<Voucher>('/vouchers', data).then((r) => r.data),

  updateVoucher: (id: number, data: UpdateVoucherRequest) =>
    axiosInstance.put<Voucher>(`/vouchers/${id}`, data).then((r) => r.data),

  deleteVoucher: (id: number) =>
    axiosInstance.delete(`/vouchers/${id}`).then((r) => r.data),

  getActiveVouchers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Voucher>>('/vouchers/active', { params }).then((r) => r.data.content || r.data),
};
