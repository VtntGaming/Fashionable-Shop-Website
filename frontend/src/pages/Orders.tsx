import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { orderApi } from '@/api/orderApi';
import type { OrderResponse } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP, ITEMS_PER_PAGE } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Orders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  usePageTitle('Đơn hàng của tôi');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, unknown> = { page, size: ITEMS_PER_PAGE };
    if (filterStatus) params.status = filterStatus;
    orderApi.getMyOrders(params as { page: number; size: number })
      .then((res) => {
        setOrders(Array.isArray(res?.content) ? res.content : []);
        setTotalPages(Number(res?.totalPages) || 0);
      })
      .catch(() => {
        setOrders([]);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [page, filterStatus]);

  return (
    <Container className="page-padding">
      <PageHeader
        title="Đơn hàng của tôi"
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Đơn hàng' }]}
        actions={
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
            className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">Tất cả</option>
            {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        }
      />

      {loading ? <LoadingSpinner /> : orders.length === 0 ? (
        <EmptyState icon={<Package size={48} />} title="Chưa có đơn hàng" description="Bạn chưa có đơn hàng nào" actionLabel="Mua sắm ngay" actionLink="/shop" />
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
              const orderItems = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="card p-4 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Mã đơn: </span>
                      <span className="font-semibold text-sm">{order.orderCode}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                      <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {orderItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600 truncate flex-1">{item.productName}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                    {orderItems.length > 3 && <p className="text-xs text-gray-400">+{orderItems.length - 3} sản phẩm khác</p>}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border-light">
                    <div className="text-sm text-gray-500">{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-accent">{formatCurrency(order.totalAmount)}</span>
                      <Link to={`/orders/${order.id}`} className="flex items-center gap-1 text-sm text-accent hover:underline">
                        <Eye size={14} /> Chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />}
        </>
      )}
    </Container>
  );
}
