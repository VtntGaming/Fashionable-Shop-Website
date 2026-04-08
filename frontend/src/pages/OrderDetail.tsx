import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Package } from 'lucide-react';
import { orderApi } from '@/api/orderApi';
import type { OrderResponse } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/utils/constants';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderApi.getOrderById(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);
  usePageTitle(order ? `Đơn hàng #${order.orderCode}` : 'Đơn hàng');

  const handleCancel = async () => {
    if (!order || order.status !== 'PENDING') return;
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    try {
      await orderApi.cancelOrder(order.id);
      setOrder({ ...order, status: 'CANCELLED' });
      toast.success('Đã hủy đơn hàng');
    } catch { toast.error('Không thể hủy đơn hàng'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-16"><p>Không tìm thấy đơn hàng.</p><Link to="/orders" className="text-accent mt-4 inline-block">Quay lại</Link></div>;

  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  const steps = ['PENDING', 'PAID', 'SHIPPING', 'DELIVERED'];
  const currentStep = steps.indexOf(order.status);

  return (
    <Container narrow className="page-padding">
      <PageHeader
        title={`Đơn hàng #${order.orderCode}`}
        subtitle={formatDate(order.createdAt)}
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Đơn hàng', to: '/orders' }, { label: order.orderCode }]}
        actions={
          <div className="flex items-center gap-3">
            <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            {order.status === 'PENDING' && (
              <button onClick={handleCancel} className="text-sm text-red-500 hover:underline">Hủy đơn</button>
            )}
          </div>
        }
      />

      {/* Status timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const info = ORDER_STATUS_MAP[step];
              const done = i <= currentStep;
              return (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs mt-2 ${done ? 'text-accent font-medium' : 'text-gray-400'}`}>{info.label}</span>
                  {i < steps.length - 1 && (
                    <div className={`absolute top-4 left-[calc(50%+16px)] right-[calc(-50%+16px)] h-0.5 ${i < currentStep ? 'bg-accent' : 'bg-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Shipping info */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin size={16} /> Thông tin giao hàng</h3>
          <p className="text-sm text-text-muted mb-1">{order.shippingAddress}</p>
          <p className="text-sm text-text-muted flex items-center gap-1"><Phone size={14} /> {order.phone}</p>
        </div>
        {/* Payment info */}
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><CreditCard size={16} /> Thanh toán</h3>
          <p className="text-sm text-text-muted">{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</p>
        </div>
      </div>

      {/* Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} /> Sản phẩm ({order.itemCount})</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(item.priceAtPurchase)} x {item.quantity}</p>
              </div>
              <span className="font-medium text-sm">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border-light mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>Tổng cộng</span>
          <span className="text-accent">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </Container>
  );
}
