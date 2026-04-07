import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Package, DollarSign, BarChart3 } from 'lucide-react';
import { adminApi } from '@/api/adminApi';
import { formatCurrency } from '@/utils/formatCurrency';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function Reports() {
  const [revenueData, setRevenueData] = useState<Record<string, unknown>[]>([]);
  const [productData, setProductData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'revenue' | 'products' | 'orders'>('revenue');

  useEffect(() => {
    Promise.all([
      adminApi.getRevenueReport().catch(() => []),
      adminApi.getProductReport().catch(() => []),
    ]).then(([rev, prod]) => {
      setRevenueData(Array.isArray(rev) ? rev : []);
      setProductData(Array.isArray(prod) ? prod : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const tabs = [
    { key: 'revenue' as const, label: 'Doanh thu', icon: DollarSign },
    { key: 'products' as const, label: 'Sản phẩm', icon: Package },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Báo cáo & Thống kê</h1>

      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'revenue' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Doanh thu theo thời gian</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2} dot={{ fill: '#c9a84c', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">Chưa có dữ liệu doanh thu</p>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Sản phẩm bán chạy</h3>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={productData.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={150} />
                <Tooltip />
                <Bar dataKey="sold" fill="#c9a84c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">Chưa có dữ liệu sản phẩm</p>
          )}
        </div>
      )}
    </div>
  );
}
