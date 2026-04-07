import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import UserLayout from '@/components/layout/UserLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import { PrivateRoute, AdminRoute, GuestRoute } from '@/components/common/RouteGuards';
import { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OAuthSuccess = lazy(() => import('@/pages/OAuthSuccess'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const PaymentResult = lazy(() => import('@/pages/PaymentResult'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetail = lazy(() => import('@/pages/OrderDetail'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Profile = lazy(() => import('@/pages/Profile'));
const Vouchers = lazy(() => import('@/pages/Vouchers'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin pages
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ProductManagement = lazy(() => import('@/pages/admin/ProductManagement'));
const CategoryManagement = lazy(() => import('@/pages/admin/CategoryManagement'));
const OrderManagement = lazy(() => import('@/pages/admin/OrderManagement'));
const CustomerManagement = lazy(() => import('@/pages/admin/CustomerManagement'));
const VoucherManagement = lazy(() => import('@/pages/admin/VoucherManagement'));
const ReviewManagement = lazy(() => import('@/pages/admin/ReviewManagement'));
const Reports = lazy(() => import('@/pages/admin/Reports'));

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: 'Lexend, sans-serif' } }} />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes with UserLayout */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/vouchers" element={<Vouchers />} />
            <Route path="/payment-result" element={<PaymentResult />} />

            {/* Guest only */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Auth required */}
            <Route element={<PrivateRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>

          {/* OAuth callback (no layout) */}
          <Route path="/oauth/success" element={<OAuthSuccess />} />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="vouchers" element={<VoucherManagement />} />
              <Route path="reviews" element={<ReviewManagement />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
