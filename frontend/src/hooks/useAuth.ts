import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '@/store';
import { setCredentials, logout as logoutAction, setLoading } from '@/store/authSlice';
import { clearCartState } from '@/store/cartSlice';
import { authApi } from '@/api/authApi';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import toast from 'react-hot-toast';

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseData = (error as { response?: { data?: ApiErrorPayload } })?.response?.data;
  if (responseData?.message) return responseData.message;
  if (responseData?.error) return responseData.error;
  return fallback;
};

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const login = async (data: LoginRequest) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.login(data);
      dispatch(setCredentials(response));
      toast.success('Đăng nhập thành công!');
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const register = async (data: RegisterRequest) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.register(data);
      dispatch(setCredentials(response));
      toast.success('Đăng ký thành công!');
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    dispatch(clearCartState());
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  return { user, isAuthenticated, isLoading, login, register, logout };
}
