import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi } from '@/api/orderApi';
import type { OrderResponse } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '@/utils/constants';
import Pagination from '@/components/common/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    const params: Record<string, unknown> = { page, size: 10 };
    if (filterStatus) params.status = filterStatus;
    orderApi.getAllOrders(params as never)
      .then((res) => { setOrders(res.content); setTotalPages(res.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, status);
      toast.success('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch { toast.error('Không thể cập nhật trạng thái'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
        >
          <option value="">Tất cả</option>
          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Mã đơn</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Khách hàng</th>
                  <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Tổng</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thanh toán</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Trạng thái</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ngày tạo</th>
                  <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => {
                  const sInfo = ORDER_STATUS_MAP[o.status] || { label: o.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-medium">{o.orderCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{o.userEmail}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-center"><span className="text-xs">{PAYMENT_METHOD_MAP[o.paymentMethod] || o.paymentMethod}</span></td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${sInfo.color} cursor-pointer`}
                        >
                          {Object.entries(ORDER_STATUS_MAP).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-center">
                        <Link to={`/admin/orders/${o.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors inline-block">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && <div className="border-t border-gray-100 p-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </div>
      )}
    </div>
  );
}
