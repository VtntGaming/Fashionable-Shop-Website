export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  children?: Category[];
  productCount?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: number | null;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
