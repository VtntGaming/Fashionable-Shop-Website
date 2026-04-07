export interface PaymentResponse {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  paymentMethod: 'VNPAY' | 'COD';
  vnpTxnRef: string | null;
  createdAt: string;
  paidAt: string | null;
}

export interface CreatePaymentRequest {
  orderId: number;
  returnUrl?: string;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  message?: string;
}

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: string;
  contentType?: string;
  message?: string;
}

export interface DashboardResponse {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalOrderValue?: number;
  averageOrderValue?: number;
  pendingOrders?: number;
  successfulOrders?: number;
  conversionRate?: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth?: Record<string, number>;
  revenueByPaymentMethod?: Record<string, number>;
  topProducts?: string[];
  topCategories?: string[];
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  salePrice: number | null;
  stock?: number;
  status?: string;
  addedAt?: string;
  createdAt?: string;
}
