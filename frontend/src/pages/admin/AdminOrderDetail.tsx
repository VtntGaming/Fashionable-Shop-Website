import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard, Package } from 'lucide-react';
import { orderApi } from '@/api/orderApi';
import type { OrderResponse } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/utils/constants';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderApi.getOrder(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!order) return;
    try {
      await orderApi.updateOrderStatus(order.id, status);
      setOrder({ ...order, status: status as OrderResponse['status'] });
      toast.success('Cập nhật trạng thái thành công!');
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!order) return <div className="text-center py-16"><p>Không tìm thấy đơn hàng.</p><Link to="/admin/orders" className="text-accent mt-4 inline-block">Quay lại</Link></div>;

  const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div>
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent mb-4">
        <ArrowLeft size={14} /> Quay lại danh sách
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Đơn hàng #{order.orderCode}</h1>
          <p className="text-sm text-text-muted mt-1">{formatDate(order.createdAt)} — {order.userEmail}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer ${statusInfo.color}`}
          >
            {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><MapPin size={16} /> Giao hàng</h3>
          <p className="text-sm text-text-muted mb-1">{order.shippingAddress}</p>
          <p className="text-sm text-text-muted flex items-center gap-1"><Phone size={14} /> {order.phone}</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><CreditCard size={16} /> Thanh toán</h3>
          <p className="text-sm text-text-muted">{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Package size={16} /> Sản phẩm ({order.itemCount})</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-text-muted mt-1">{formatCurrency(item.priceAtPurchase)} x {item.quantity}</p>
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
    </div>
  );
}
