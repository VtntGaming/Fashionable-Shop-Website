import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setTokens } from '@/store/authSlice';
import { userApi } from '@/api/userApi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      dispatch(setTokens({ accessToken: token, refreshToken }));

      userApi.getProfile()
        .then((user) => {
          dispatch(setCredentials({ accessToken: token, refreshToken, tokenType: 'Bearer', expiresIn: 0, user: { id: user.id, email: user.email, fullName: user.fullName, phone: user.phone, address: user.address, role: user.role as 'USER' | 'ADMIN', status: user.status as 'ACTIVE' | 'INACTIVE' } }));
          navigate('/', { replace: true });
        })
        .catch(() => {
          navigate('/login', { replace: true });
        });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-500 mt-4">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
