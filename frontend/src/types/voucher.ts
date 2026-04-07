export interface Voucher {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  quantity: number;
  usedCount?: number;
  startDate: string;
  endDate: string;
  isValid?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateVoucherRequest {
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  quantity: number;
  startDate: string;
  endDate: string;
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {}
