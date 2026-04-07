export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const VNPAY_RETURN_URL = import.meta.env.VITE_VNPAY_RETURN_URL || 'http://localhost:3000/payment-result';
export const GOOGLE_OAUTH_URL = `${API_BASE_URL.replace('/api', '')}/oauth2/authorization/google`;

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export const PAYMENT_METHOD_MAP: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  VNPAY: 'Thanh toán VNPay',
};

export const ITEMS_PER_PAGE = 12;
