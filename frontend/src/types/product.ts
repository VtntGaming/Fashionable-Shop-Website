export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brand: string;
  imageUrl: string;
  images: string[];
  views: number;
  averageRating: number;
  reviewCount: number;
  featured?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  categoryId: number;
  brand: string;
  imageUrl?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductRecommendation {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  imageUrl: string;
  rating: number;
  views: number;
}
