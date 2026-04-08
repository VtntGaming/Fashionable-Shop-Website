import axiosInstance from './axiosInstance';
import type { Voucher, CreateVoucherRequest, UpdateVoucherRequest } from '@/types/voucher';
import type { PaginatedResponse } from '@/types/api';

export const voucherApi = {
  getVouchers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Voucher>>('/vouchers', { params }).then((r) => r.data),

  getVoucherByCode: (code: string) =>
    axiosInstance.get<Voucher>(`/vouchers/${code}`).then((r) => r.data),

  validateVoucher: (data: { code: string; orderAmount: number }) =>
    axiosInstance.post<number>('/vouchers/validate', null, { params: data }).then((r) => ({ discountAmount: Number(r.data) || 0 })),

  getAllVouchers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Voucher>>('/vouchers/admin/all', { params }).then((r) => Array.isArray(r.data?.content) ? r.data.content : []),

  createVoucher: (data: CreateVoucherRequest) =>
    axiosInstance.post<Voucher>('/vouchers', data).then((r) => r.data),

  updateVoucher: (id: number, data: UpdateVoucherRequest) =>
    axiosInstance.put<Voucher>(`/vouchers/${id}`, data).then((r) => r.data),

  deleteVoucher: (id: number) =>
    axiosInstance.delete(`/vouchers/${id}`).then((r) => r.data),

  getActiveVouchers: (params?: { page?: number; size?: number }) =>
    axiosInstance.get<PaginatedResponse<Voucher>>('/vouchers', { params }).then((r) => Array.isArray(r.data?.content) ? r.data.content : []),
};
