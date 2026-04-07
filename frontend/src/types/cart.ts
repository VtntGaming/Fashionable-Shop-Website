export interface CartResponse {
  id: number;
  userId: number;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';
  createdAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  priceAtAdd: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartRequest {
  cartItemId: number;
  quantity: number;
}
