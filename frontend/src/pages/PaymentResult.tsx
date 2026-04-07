import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { paymentApi } from '@/api/paymentApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    const params = searchParams.toString();
    if (params) {
      paymentApi.vnpayReturn(params)
        .then((res: { success?: boolean; orderId?: number }) => {
          setStatus(res.success ? 'success' : 'failed');
          setOrderId(res.orderId || null);
        })
        .catch(() => setStatus('failed'));
    } else {
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'success' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-6">Đơn hàng của bạn đã được xác nhận. Cảm ơn bạn đã mua sắm!</p>
            <div className="flex gap-3 justify-center">
              {orderId && (
                <Link to={`/orders/${orderId}`} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors">
                  Xem đơn hàng
                </Link>
              )}
              <Link to="/shop" className="border border-gray-200 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-6">Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/orders" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors">
                Đơn hàng của tôi
              </Link>
              <Link to="/shop" className="border border-gray-200 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
