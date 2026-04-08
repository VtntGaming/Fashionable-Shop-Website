import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';

const schema = z.object({ email: z.string().email('Email không hợp lệ') });
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email });
      setSent(true);
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Quên mật khẩu</h1>
          <p className="text-gray-500 text-sm">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Đã gửi email!</h3>
              <p className="text-sm text-gray-500 mb-6">Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.</p>
              <Link to="/login" className="text-accent text-sm font-medium hover:underline">Quay lại đăng nhập</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </button>

              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-accent mt-2">
                <ArrowLeft size={14} /> Quay lại đăng nhập
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
