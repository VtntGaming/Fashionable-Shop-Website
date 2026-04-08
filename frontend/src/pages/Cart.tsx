import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { RootState } from '@/store';
import { useCart } from '@/hooks/useCart';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { formatCurrency } from '@/utils/formatCurrency';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Cart() {
  const { items, totalAmount, itemCount, isLoading } = useSelector((s: RootState) => s.cart);
  const { fetchCart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const safeItems = Array.isArray(items) ? items : [];
  usePageTitle('Giỏ hàng');

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (isLoading) return <LoadingSpinner />;

  if (safeItems.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Giỏ hàng trống"
          description="Hãy thêm sản phẩm yêu thích vào giỏ hàng"
          actionLabel="Mua sắm ngay"
          onAction={() => navigate('/shop')}
        />
      </Container>
    );
  }

  return (
    <Container className="page-padding">
      <PageHeader
        title={`Giỏ hàng (${itemCount} sản phẩm)`}
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Giỏ hàng' }]}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {safeItems.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-sm transition-shadow">
              <Link to={`/product/${item.productId}`} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{item.productName}</h3>
                <p className="text-accent font-semibold mt-1">{formatCurrency(item.priceAtAdd)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-50"><Minus size={14} /></button>
                    <span className="px-3 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-50"><Plus size={14} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{formatCurrency(item.subtotal)}</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Xóa tất cả</button>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit sticky top-24 shadow-sm">
          <h2 className="font-bold mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tổng sản phẩm</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tạm tính</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-accent">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-light transition-colors"
          >
            Tiến hành thanh toán <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </Container>
  );
}
