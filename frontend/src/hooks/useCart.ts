import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setCart, setCartLoading } from '@/store/cartSlice';
import { cartApi } from '@/api/cartApi';
import toast from 'react-hot-toast';

export function useCart() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalAmount, itemCount, isLoading } = useSelector((state: RootState) => state.cart);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      dispatch(setCartLoading(true));
      const data = await cartApi.getCart();
      dispatch(setCart({ items: data.items, totalAmount: data.totalAmount, itemCount: data.itemCount }));
    } catch {
      // silent fail
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [dispatch, isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      const data = await cartApi.addToCart({ productId, quantity });
      dispatch(setCart({ items: data.items, totalAmount: data.totalAmount, itemCount: data.itemCount }));
      toast.success('Đã thêm vào giỏ hàng!');
    } catch {
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const data = await cartApi.updateCartItem({ cartItemId, quantity });
      dispatch(setCart({ items: data.items, totalAmount: data.totalAmount, itemCount: data.itemCount }));
    } catch {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const data = await cartApi.removeCartItem(cartItemId);
      dispatch(setCart({ items: data.items, totalAmount: data.totalAmount, itemCount: data.itemCount }));
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      dispatch(setCart({ items: [], totalAmount: 0, itemCount: 0 }));
      toast.success('Đã xóa toàn bộ giỏ hàng');
    } catch {
      toast.error('Không thể xóa giỏ hàng');
    }
  };

  return { items, totalAmount, itemCount, isLoading, fetchCart, addToCart, updateQuantity, removeItem, clearCart };
}
