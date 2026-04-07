export interface OrderResponse {
  id: number;
  orderCode: string;
  userId: number;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'VNPAY';
  voucherId: number | null;
  itemCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'VNPAY';
  voucherId?: number;
}
