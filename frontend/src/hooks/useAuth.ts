import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { setCredentials, logout as logoutAction } from '@/store/authSlice';
import { clearCartState } from '@/store/cartSlice';
import { authApi } from '@/api/authApi';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import toast from 'react-hot-toast';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    dispatch(setCredentials(response));
    toast.success('Đăng nhập thành công!');
    return response;
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    dispatch(setCredentials(response));
    toast.success('Đăng ký thành công!');
    return response;
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearCartState());
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}
