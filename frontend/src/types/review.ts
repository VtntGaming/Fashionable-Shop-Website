export interface Review {
  id: number;
  userId: number;
  userName?: string;
  productId: number;
  productName?: string;
  rating: number;
  comment: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  comment: string;
}
