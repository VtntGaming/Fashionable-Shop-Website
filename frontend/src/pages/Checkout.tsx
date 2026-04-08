import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, CreditCard, Banknote, Tag } from 'lucide-react';
import type { RootState } from '@/store';
import { orderApi } from '@/api/orderApi';
import { paymentApi } from '@/api/paymentApi';
import { voucherApi } from '@/api/voucherApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Container from '@/components/ui/Container';
import PageHeader from '@/components/common/PageHeader';
import { useCart } from '@/hooks/useCart';
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Vui lòng nhập địa chỉ giao hàng'),
  phone: z.string().regex(/^(0|\+84)\d{9}$/, 'Số điện thoại không hợp lệ'),
  paymentMethod: z.enum(['COD', 'VNPAY']),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { items, totalAmount, isLoading } = useSelector((s: RootState) => s.cart);
  const user = useSelector((s: RootState) => s.auth.user);
  const { fetchCart } = useCart();
  const navigate = useNavigate();
  usePageTitle('Thanh toán');
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ id: number; code: string; discount: number } | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || '',
      phone: user?.phone || '',
      paymentMethod: 'COD',
    },
  });

  const paymentMethod = watch('paymentMethod');

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    try {
      const voucher = await voucherApi.getVoucherByCode(voucherCode.trim());
      if (totalAmount >= (voucher.minOrderValue || 0)) {
        const discount = voucher.discountType === 'PERCENT'
          ? Math.min(totalAmount * voucher.discountValue / 100, voucher.maxDiscount || Infinity)
          : voucher.discountValue;
        setAppliedVoucher({ id: voucher.id, code: voucher.code, discount });
        toast.success(`Áp dụng mã giảm giá: -${formatCurrency(discount)}`);
      } else {
        toast.error(`Đơn hàng tối thiểu ${formatCurrency(voucher.minOrderValue || 0)}`);
      }
    } catch {
      toast.error('Mã giảm giá không hợp lệ');
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitting(true);
    try {
      const order = await orderApi.createOrder({
        shippingAddress: data.shippingAddress,
        phone: data.phone,
        paymentMethod: data.paymentMethod,
        voucherId: appliedVoucher?.id,
      });

      if (data.paymentMethod === 'VNPAY') {
        const paymentResponse = await paymentApi.createVnPayPayment({ orderId: order.id });
        window.location.href = paymentResponse.paymentUrl;
      } else {
        toast.success('Đặt hàng thành công!');
        navigate(`/orders/${order.id}`);
      }
    } catch {
      toast.error('Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const finalTotal = totalAmount - (appliedVoucher?.discount || 0);

  return (
    <Container className="page-padding">
      <PageHeader
        title="Thanh toán"
        breadcrumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Giỏ hàng', to: '/cart' }, { label: 'Thanh toán' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left - form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="card p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18} /> Thông tin giao hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Địa chỉ</label>
                  <textarea
                    {...register('shippingAddress')}
                    rows={2}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent resize-none"
                  />
                  {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="0123456789"
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={18} /> Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-accent bg-accent/5' : 'border-border'}`}>
                  <input {...register('paymentMethod')} type="radio" value="COD" className="accent-accent" />
                  <Banknote size={18} className="text-text-muted" />
                  <div>
                    <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-text-muted">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === 'VNPAY' ? 'border-accent bg-accent/5' : 'border-border'}`}>
                  <input {...register('paymentMethod')} type="radio" value="VNPAY" className="accent-accent" />
                  <CreditCard size={18} className="text-text-muted" />
                  <div>
                    <p className="text-sm font-medium">Thanh toán VNPay</p>
                    <p className="text-xs text-text-muted">Thanh toán qua cổng VNPay (ATM, Visa, QR)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right - summary */}
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="font-bold mb-4">Đơn hàng của bạn</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Voucher */}
            <div className="border-t border-border-light pt-4 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mã giảm giá"
                    className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
                <button type="button" onClick={handleApplyVoucher} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                  Áp dụng
                </button>
              </div>
              {appliedVoucher && (
                <div className="flex items-center justify-between mt-2 text-sm text-green-600">
                  <span>Mã: {appliedVoucher.code}</span>
                  <button type="button" onClick={() => setAppliedVoucher(null)} className="text-red-500 text-xs hover:underline">Xóa</button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Tạm tính</span><span>{formatCurrency(totalAmount)}</span></div>
              {appliedVoucher && (
                <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatCurrency(appliedVoucher.discount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Phí vận chuyển</span><span className="text-green-600">Miễn phí</span></div>
            </div>
            <div className="border-t border-border-light pt-4 mb-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-accent">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : paymentMethod === 'VNPAY' ? 'Thanh toán VNPay' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </form>
    </Container>
  );
}
