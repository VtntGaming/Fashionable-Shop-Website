import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, User, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import type { RootState } from '@/store';
import { updateProfile } from '@/store/authSlice';
import { userApi } from '@/api/userApi';
import { fileApi } from '@/api/fileApi';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const user = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register: rp, handleSubmit: hsp, formState: { errors: ep }, reset: resetProfile } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const { register: rpw, handleSubmit: hspw, formState: { errors: epw }, reset: resetPassword } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({ fullName: user.fullName, phone: user.phone || '', address: user.address || '' });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setSaving(true);
    try {
      const updated = await userApi.updateProfile(data);
      dispatch(updateProfile(updated));
      toast.success('Cập nhật thành công!');
    } catch { toast.error('Có lỗi xảy ra'); }
    finally { setSaving(false); }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setSaving(true);
    try {
      await userApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      resetPassword();
    } catch { toast.error('Mật khẩu hiện tại không đúng'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fileApi.uploadAvatar(file);
      dispatch(updateProfile({ avatarUrl: res.fileUrl }));
      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch { toast.error('Không thể tải ảnh lên'); }
    finally { setUploading(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tài khoản của tôi</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            <ImageWithFallback src={user.avatarUrl || undefined} alt={user.fullName} className="w-full h-full object-cover" />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 bg-accent text-white p-1.5 rounded-full hover:bg-accent-light transition-colors"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div>
          <h2 className="font-semibold">{user.fullName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('profile')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'profile' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'password' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {tab === 'profile' ? (
        <form onSubmit={hsp(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Họ và tên</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...rp('fullName')} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent" />
            </div>
            {ep.fullName && <p className="text-red-500 text-xs mt-1">{ep.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={user.email} disabled className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Số điện thoại</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...rp('phone')} type="tel" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Địa chỉ</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea {...rp('address')} rows={2} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent resize-none" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      ) : (
        <form onSubmit={hspw(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Mật khẩu hiện tại</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...rpw('currentPassword')} type={showPasswords ? 'text' : 'password'} className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent" />
              <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {epw.currentPassword && <p className="text-red-500 text-xs mt-1">{epw.currentPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...rpw('newPassword')} type={showPasswords ? 'text' : 'password'} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent" />
            </div>
            {epw.newPassword && <p className="text-red-500 text-xs mt-1">{epw.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input {...rpw('confirmPassword')} type={showPasswords ? 'text' : 'password'} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent" />
            </div>
            {epw.confirmPassword && <p className="text-red-500 text-xs mt-1">{epw.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
}
