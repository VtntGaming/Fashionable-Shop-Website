import { useEffect, useState } from 'react';
import { Package, Users, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '@/api/adminApi';
import type { DashboardResponse } from '@/types/payment';
import { formatCurrency } from '@/utils/formatCurrency';
import { ORDER_STATUS_MAP } from '@/utils/constants';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const COLORS = ['#c9a84c', '#1a1a2e', '#4ade80', '#f87171', '#60a5fa', '#a78bfa'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center py-8 text-gray-500">Không thể tải dữ liệu.</p>;

  const statusData = Object.entries(data.ordersByStatus || {}).map(([key, value]) => ({
    name: ORDER_STATUS_MAP[key]?.label || key,
    value,
  }));

  const paymentData = Object.entries(data.revenueByPaymentMethod || {}).map(([key, value]) => ({
    name: key === 'COD' ? 'COD' : 'VNPay',
    value,
  }));

  const cards = [
    { label: 'Tổng đơn hàng', value: data.totalOrders?.toLocaleString() || '0', icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tổng người dùng', value: data.totalUsers?.toLocaleString() || '0', icon: Users, color: 'bg-green-50 text-green-600' },
    { label: 'Tổng sản phẩm', value: data.totalProducts?.toLocaleString() || '0', icon: Package, color: 'bg-purple-50 text-purple-600' },
    { label: 'Tổng doanh thu', value: formatCurrency(data.totalRevenue || 0), icon: DollarSign, color: 'bg-accent/10 text-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-bold">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {statusData.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Phân bố đơn hàng</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {paymentData.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Doanh thu theo phương thức</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="value" fill="#c9a84c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
