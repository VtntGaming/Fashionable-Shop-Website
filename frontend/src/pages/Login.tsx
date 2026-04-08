import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { GOOGLE_OAUTH_URL } from '@/utils/constants';

const loginSchema = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading: loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  usePageTitle('Đăng nhập');

  const fromState = (location.state as { from?: { pathname?: string } | string } | null)?.from;
  const redirectTo = typeof fromState === 'string' ? fromState : fromState?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const success = await login({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (success) {
      navigate(redirectTo, { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[90%] lg:max-w-4xl grid md:grid-cols-2 overflow-hidden rounded-2xl shadow-card border border-border">
        {/* Left - Illustration */}
        <div className="hidden md:flex flex-col justify-center bg-gradient-to-br from-primary to-primary-light text-white p-10">
          <div className="mb-8">
            <span className="text-3xl font-bold">Fashion</span>
            <span className="text-3xl font-light text-accent">Shop</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-4">Chào mừng bạn<br />quay trở lại!</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Đăng nhập để khám phá bộ sưu tập thời trang mới nhất, nhận ưu đãi độc quyền và quản lý đơn hàng dễ dàng.
          </p>
          <div className="mt-8 flex gap-6 text-sm">
            <div><span className="text-accent font-bold text-xl">1000+</span><p className="text-gray-400 mt-1">Sản phẩm</p></div>
            <div><span className="text-accent font-bold text-xl">500+</span><p className="text-gray-400 mt-1">Đánh giá</p></div>
            <div><span className="text-accent font-bold text-xl">99%</span><p className="text-gray-400 mt-1">Hài lòng</p></div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="bg-white p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Đăng nhập</h1>
            <p className="text-gray-500 text-sm">Nhập thông tin tài khoản để tiếp tục</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-accent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-accent hover:underline">Quên mật khẩu?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-text-muted">hoặc</span></div>
          </div>

          <a
            href={GOOGLE_OAUTH_URL}
            className="w-full flex items-center justify-center gap-2 border border-border py-2.5 rounded-lg text-sm font-medium hover:bg-surface-alt transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Đăng nhập với Google
          </a>

          <p className="text-center text-sm mt-6 text-gray-500">
            Chưa có tài khoản? <Link to="/register" className="text-accent font-medium hover:underline">Đăng ký</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
