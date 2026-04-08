import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { voucherApi } from '@/api/voucherApi';
import type { Voucher } from '@/types/voucher';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const schema = z.object({
  code: z.string().min(3, 'Ma toi thieu 3 ky tu'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENT', 'AMOUNT']),
  discountValue: z.coerce.number().positive('Gia tri phai lon hon 0'),
  minOrderValue: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().nullable().optional(),
  quantity: z.coerce.number().int().positive('So luong phai lon hon 0'),
  endDate: z.string().min(1, 'Vui long chon ngay het han'),
});
type VoucherForm = z.infer<typeof schema>;

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const discountType = watch('discountType') as 'PERCENT' | 'AMOUNT';

  const fetchVouchers = () => {
    setLoading(true);
    voucherApi.getAllVouchers()
      .then((data) => setVouchers(Array.isArray(data) ? data : []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVouchers(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ code: '', description: '', discountType: 'PERCENT', discountValue: 0, minOrderValue: 0, maxDiscount: null, quantity: 100, endDate: '' });
    setShowModal(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    reset({
      code: v.code, description: v.description || '', discountType: v.discountType,
      discountValue: v.discountValue, minOrderValue: v.minOrderValue, maxDiscount: v.maxDiscount,
      quantity: v.quantity, endDate: v.endDate ? v.endDate.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data: VoucherForm) => {
    setSaving(true);
    try {
      if (editing) {
        await voucherApi.updateVoucher(editing.id, data as never);
        toast.success('Cap nhat voucher thanh cong!');
      } else {
        await voucherApi.createVoucher(data as never);
        toast.success('Them voucher thanh cong!');
      }
      setShowModal(false);
      fetchVouchers();
    } catch { toast.error('Co loi xay ra'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ban co chac muon xoa voucher nay?')) return;
    try {
      await voucherApi.deleteVoucher(id);
      toast.success('Da xoa voucher');
      fetchVouchers();
    } catch { toast.error('Khong the xoa voucher'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quan ly voucher</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-light transition-colors">
          <Plus size={16} /> Them voucher
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Ma</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Giam gia</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Don toi thieu</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">So luong</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Het han</th>
                <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">Thao tac</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 text-accent px-1.5 py-0.5 rounded text-sm font-medium">{v.code}</code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatCurrency(v.discountValue)}
                    {v.maxDiscount && v.discountType === 'PERCENT' && (
                      <span className="text-xs text-gray-400 ml-1">(max {formatCurrency(v.maxDiscount)})</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(v.minOrderValue)}</td>
                  <td className="px-4 py-3 text-sm text-center">{v.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(v.endDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(v)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Sua voucher' : 'Them voucher'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ma voucher</label>
                <input {...register('code')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent uppercase" />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mo ta</label>
                <input {...register('description')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Loai giam</label>
                  <select {...register('discountType')} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent">
                    <option value="PERCENT">Phan tram (%)</option>
                    <option value="AMOUNT">Co dinh (VND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gia tri giam</label>
                  <input {...register('discountValue')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Don toi thieu</label>
                  <input {...register('minOrderValue')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                </div>
                {discountType === 'PERCENT' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Giam toi da</label>
                    <input {...register('maxDiscount')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">So luong</label>
                  <input {...register('quantity')} type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Het han</label>
                  <input {...register('endDate')} type="datetime-local" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-accent" />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-accent text-white py-2.5 rounded-lg font-medium hover:bg-accent-light transition-colors disabled:opacity-50">
                  {saving ? 'Dang luu...' : editing ? 'Cap nhat' : 'Them'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors">Huy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
