import { useEffect, useState } from 'react';
import { Tag, Copy, Check, Clock, Percent } from 'lucide-react';
import { voucherApi } from '@/api/voucherApi';
import type { Voucher } from '@/types/voucher';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  usePageTitle('Mã giảm giá');

  useEffect(() => {
    voucherApi.getActiveVouchers()
      .then((data) => setVouchers(Array.isArray(data) ? data : []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (voucher: Voucher) => {
    navigator.clipboard.writeText(voucher.code);
    setCopiedId(voucher.id);
    toast.success('Đã sao chép mã giảm giá!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container className="page-padding">
      <PageHeader
        title="Mã giảm giá"
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Mã giảm giá' }]}
      />

      {vouchers.length === 0 ? (
        <EmptyState
          icon={<Tag size={48} />}
          title="Chưa có mã giảm giá"
          description="Hiện tại chưa có voucher nào khả dụng"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vouchers.map((v) => (
            <div key={v.id} className="card overflow-hidden hover:shadow-card-hover transition-shadow">
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-4 border-b border-dashed border-accent/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent size={18} className="text-accent" />
                    <span className="text-2xl font-bold text-accent">
                      {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(v)}
                    className="flex items-center gap-1 bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-accent-light transition-colors"
                  >
                    {copiedId === v.id ? <><Check size={12} /> Đã sao chép</> : <><Copy size={12} /> Sao chép</>}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <code className="bg-gray-100 text-accent px-2 py-0.5 rounded text-sm font-medium">{v.code}</code>
                </div>
                {v.description && <p className="text-sm text-gray-600 mb-3">{v.description}</p>}
                <div className="space-y-1 text-xs text-gray-500">
                  {v.minOrderValue > 0 && <p>Đơn tối thiểu: {formatCurrency(v.minOrderValue)}</p>}
                  {v.maxDiscount && v.discountType === 'PERCENT' && <p>Giảm tối đa: {formatCurrency(v.maxDiscount)}</p>}
                  <p className="flex items-center gap-1"><Clock size={12} /> Hết hạn: {formatDate(v.endDate)}</p>
                  <p>Còn lại: {v.quantity} lượt</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
