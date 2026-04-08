import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '@/types/cart';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  itemCount: 0,
  isLoading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<{ items: CartItem[]; totalAmount: number; itemCount: number }>) => {
      state.items = Array.isArray(action.payload.items) ? action.payload.items : [];
      state.totalAmount = Number(action.payload.totalAmount) || 0;
      state.itemCount = Number(action.payload.itemCount) || state.items.length;
    },
    clearCartState: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.itemCount = 0;
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCart, clearCartState, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
