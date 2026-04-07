import axiosInstance from './axiosInstance';
import type { CreatePaymentResponse, PaymentResponse } from '@/types/payment';

export const paymentApi = {
  createVnPayPayment: (data: { orderId: number; returnUrl?: string }) =>
    axiosInstance.post<CreatePaymentResponse>('/payments/vnpay/create', data).then((r) => r.data),

  getPaymentByOrder: (orderId: number) =>
    axiosInstance.get<PaymentResponse>(`/payments/order/${orderId}`).then((r) => r.data),

  vnpayReturn: (params: string) =>
    axiosInstance.get(`/payments/vnpay/return?${params}`).then((r) => r.data),
};
