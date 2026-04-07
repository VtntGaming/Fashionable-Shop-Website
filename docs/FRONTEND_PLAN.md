# FRONTEND DEVELOPMENT PLAN — Fashionable Shop Website

> **Mục đích**: Tài liệu hướng dẫn đầy đủ để AI Agent hoặc developer xây dựng toàn bộ frontend cho dự án Fashion Shop.
> **Backend đã hoàn thành 100%** — 53+ API endpoints, 13 modules, sẵn sàng tích hợp.

---

## MỤC LỤC

1. [Tổng quan & Tech Stack](#1-tổng-quan--tech-stack)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Khởi tạo dự án](#3-khởi-tạo-dự-án)
4. [Cấu hình cơ bản](#4-cấu-hình-cơ-bản)
5. [Hệ thống Routing](#5-hệ-thống-routing)
6. [State Management (Redux Toolkit)](#6-state-management-redux-toolkit)
7. [API Service Layer](#7-api-service-layer)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Các trang User (Customer)](#9-các-trang-user-customer)
10. [Các trang Admin](#10-các-trang-admin)
11. [Shared Components](#11-shared-components)
12. [Responsive Design & UI/UX](#12-responsive-design--uiux)
13. [Tích hợp thanh toán VNPay](#13-tích-hợp-thanh-toán-vnpay)
14. [Tích hợp Google OAuth2](#14-tích-hợp-google-oauth2)
15. [Error Handling & Loading States](#15-error-handling--loading-states)
16. [Testing](#16-testing)
17. [CI/CD Pipeline](#17-cicd-pipeline)
18. [Quy trình commit & PR](#18-quy-trình-commit--pr)
19. [API Reference đầy đủ](#19-api-reference-đầy-đủ)

---

## 1. Tổng quan & Tech Stack

| Layer | Công nghệ | Phiên bản |
|-------|-----------|-----------|
| Framework | React | 18+ |
| Build Tool | Vite | 5+ |
| Language | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| State | Redux Toolkit + RTK Query | latest |
| Routing | React Router | 6+ |
| HTTP Client | Axios | latest |
| Forms | React Hook Form + Zod | latest |
| Icons | Lucide React hoặc React Icons | latest |
| Notifications | React Hot Toast hoặc Sonner | latest |
| Charts (Admin) | Recharts | latest |
| Date | date-fns | latest |
| Testing | Vitest + React Testing Library + Playwright | latest |

**Backend API Base URL**: `http://localhost:8080/api`
**Frontend Dev Server**: `http://localhost:3000`

---

## 2. Cấu trúc thư mục

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── api/                    # API service layer
│   │   ├── axiosInstance.ts    # Axios config + interceptors
│   │   ├── authApi.ts
│   │   ├── productApi.ts
│   │   ├── categoryApi.ts
│   │   ├── cartApi.ts
│   │   ├── orderApi.ts
│   │   ├── wishlistApi.ts
│   │   ├── reviewApi.ts
│   │   ├── voucherApi.ts
│   │   ├── paymentApi.ts
│   │   ├── userApi.ts
│   │   ├── recommendationApi.ts
│   │   ├── adminApi.ts
│   │   └── fileApi.ts
│   ├── assets/                 # Images, fonts
│   ├── components/             # Shared/reusable components
│   │   ├── ui/                 # Button, Input, Modal, Badge, Skeleton...
│   │   ├── layout/             # Header, Footer, Sidebar, AdminLayout
│   │   ├── product/            # ProductCard, ProductGrid, ProductGallery
│   │   ├── cart/               # CartItem, CartSummary
│   │   ├── review/             # ReviewCard, ReviewForm, StarRating
│   │   └── common/             # Pagination, SearchBar, Breadcrumb, EmptyState
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useWishlist.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── pages/                  # Page components (1 file per route)
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── OAuthSuccess.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── PaymentResult.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── Wishlist.tsx
│   │   ├── Profile.tsx
│   │   ├── Vouchers.tsx
│   │   ├── NotFound.tsx
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── ProductManagement.tsx
│   │       ├── CategoryManagement.tsx
│   │       ├── OrderManagement.tsx
│   │       ├── CustomerManagement.tsx
│   │       ├── VoucherManagement.tsx
│   │       ├── ReviewManagement.tsx
│   │       └── Reports.tsx
│   ├── store/                  # Redux store
│   │   ├── index.ts            # Store configuration
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   └── wishlistSlice.ts
│   ├── types/                  # TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   ├── category.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   ├── review.ts
│   │   ├── voucher.ts
│   │   ├── payment.ts
│   │   ├── user.ts
│   │   └── api.ts              # Generic API response types
│   ├── utils/                  # Utility functions
│   │   ├── formatCurrency.ts
│   │   ├── formatDate.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Tailwind imports
├── .env.example
├── .eslintrc.cjs
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 3. Khởi tạo dự án

```bash
cd frontend

# Tạo project Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Cài dependencies chính
npm install axios react-router-dom @reduxjs/toolkit react-redux \
  react-hook-form @hookform/resolvers zod \
  react-hot-toast lucide-react recharts date-fns

# Cài Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# Cài dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom @playwright/test eslint \
  eslint-plugin-react-hooks eslint-plugin-react-refresh \
  @types/node
```

---

## 4. Cấu hình cơ bản

### 4.1 Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### 4.2 Environment Variables (`.env.example`)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_VNPAY_RETURN_URL=http://localhost:3000/payment-result
```

### 4.3 Axios Instance (`src/api/axiosInstance.ts`)
Cần implement:
- Base URL từ env variable
- Request interceptor: tự động gắn `Authorization: Bearer <accessToken>` header
- Response interceptor: khi nhận 401 → dùng refresh token để lấy access token mới → retry request gốc
- Nếu refresh cũng thất bại → logout user, redirect `/login`
- Xử lý concurrent refresh (dùng queue hoặc promise để tránh gọi refresh nhiều lần)

---

## 5. Hệ thống Routing

### 5.1 Public Routes (không cần đăng nhập)
| Route | Component | Mô tả |
|-------|-----------|--------|
| `/` | `Home` | Trang chủ — banner, sản phẩm nổi bật, danh mục, gợi ý |
| `/shop` | `Shop` | Danh sách sản phẩm — filter, sort, search, phân trang |
| `/shop?category={slug}` | `Shop` | Lọc theo danh mục |
| `/product/:slug` | `ProductDetail` | Chi tiết sản phẩm, gallery ảnh, reviews, sản phẩm liên quan |
| `/login` | `Login` | Đăng nhập (email/password + Google) |
| `/register` | `Register` | Đăng ký tài khoản |
| `/forgot-password` | `ForgotPassword` | Nhập email để nhận link reset |
| `/reset-password` | `ResetPassword` | Nhập mật khẩu mới (có token từ URL) |
| `/oauth-success` | `OAuthSuccess` | Nhận tokens từ Google OAuth redirect |
| `/vouchers` | `Vouchers` | Danh sách voucher khuyến mãi |
| `/payment-result` | `PaymentResult` | Kết quả thanh toán VNPay |

### 5.2 Protected Routes (cần đăng nhập — role USER hoặc ADMIN)
| Route | Component | Mô tả |
|-------|-----------|--------|
| `/cart` | `Cart` | Giỏ hàng |
| `/checkout` | `Checkout` | Thanh toán đơn hàng |
| `/orders` | `Orders` | Lịch sử đơn hàng |
| `/orders/:id` | `OrderDetail` | Chi tiết đơn hàng |
| `/wishlist` | `Wishlist` | Danh sách yêu thích |
| `/profile` | `Profile` | Thông tin cá nhân |

### 5.3 Admin Routes (cần đăng nhập — role ADMIN)
| Route | Component | Mô tả |
|-------|-----------|--------|
| `/admin/dashboard` | `Dashboard` | Thống kê tổng quan |
| `/admin/products` | `ProductManagement` | CRUD sản phẩm + upload ảnh |
| `/admin/categories` | `CategoryManagement` | CRUD danh mục (hỗ trợ cây phân cấp) |
| `/admin/orders` | `OrderManagement` | Quản lý đơn hàng + cập nhật trạng thái |
| `/admin/customers` | `CustomerManagement` | Quản lý khách hàng + bật/tắt tài khoản |
| `/admin/vouchers` | `VoucherManagement` | CRUD voucher |
| `/admin/reviews` | `ReviewManagement` | Duyệt/ẩn reviews |
| `/admin/reports` | `Reports` | Biểu đồ doanh thu, top sản phẩm |

### 5.4 Route Guards
- `PrivateRoute`: Kiểm tra user đã đăng nhập → nếu chưa redirect `/login`
- `AdminRoute`: Kiểm tra user có role ADMIN → nếu không redirect `/`
- `GuestRoute`: Nếu đã đăng nhập → redirect `/` (dùng cho Login, Register)

---

## 6. State Management (Redux Toolkit)

### 6.1 Auth Slice (`store/authSlice.ts`)
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```
- Lưu tokens vào `localStorage`
- Actions: `setCredentials`, `logout`, `updateProfile`
- Khởi tạo state từ localStorage khi app load

### 6.2 Cart Slice (`store/cartSlice.ts`)
```typescript
interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
}
```
- Sync với API khi user đã đăng nhập
- Actions: `setCart`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`

### 6.3 Wishlist Slice (`store/wishlistSlice.ts`)
```typescript
interface WishlistState {
  items: WishlistItem[];
  count: number;
  isLoading: boolean;
}
```

---

## 7. API Service Layer

Tất cả API calls đều dùng `axiosInstance` đã cấu hình ở mục 4.3.

### 7.1 Auth API (`api/authApi.ts`)
```typescript
// POST /api/auth/register
register(data: { email: string; password: string; fullName: string; phone?: string }): Promise<AuthResponse>

// POST /api/auth/login
login(data: { email: string; password: string }): Promise<AuthResponse>

// POST /api/auth/refresh
refreshToken(data: { refreshToken: string }): Promise<AuthResponse>

// POST /api/auth/forgot-password
forgotPassword(data: { email: string }): Promise<{ resetToken: string }>

// POST /api/auth/reset-password
resetPassword(data: { resetToken: string; newPassword: string }): Promise<void>

// POST /api/auth/google
googleLogin(data: { googleId: string; email: string; fullName: string }): Promise<AuthResponse>
```

### 7.2 Product API (`api/productApi.ts`)
```typescript
// GET /api/products?categoryId=&minPrice=&maxPrice=&keyword=&sortBy=&sortDir=&page=&size=
getProducts(params: ProductFilter): Promise<PaginatedResponse<Product>>

// GET /api/products/{id}
getProduct(id: number): Promise<Product>

// GET /api/products/slug/{slug}
getProductBySlug(slug: string): Promise<Product>

// GET /api/products/search?q=&page=&size=
searchProducts(params: { q: string; page?: number; size?: number }): Promise<PaginatedResponse<Product>>

// GET /api/products/featured?page=&size=
getFeaturedProducts(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Product>>

// POST /api/products (ADMIN)
createProduct(data: CreateProductRequest): Promise<Product>

// PUT /api/products/{id} (ADMIN)
updateProduct(id: number, data: UpdateProductRequest): Promise<Product>

// DELETE /api/products/{id} (ADMIN)
deleteProduct(id: number): Promise<void>
```

### 7.3 Category API (`api/categoryApi.ts`)
```typescript
// GET /api/categories
getCategories(): Promise<Category[]>

// GET /api/categories/{id}
getCategory(id: number): Promise<Category>

// GET /api/categories/slug/{slug}
getCategoryBySlug(slug: string): Promise<Category>

// GET /api/categories/{parentId}/children
getSubcategories(parentId: number): Promise<Category[]>

// POST /api/categories (ADMIN)
createCategory(data: CreateCategoryRequest): Promise<Category>

// PUT /api/categories/{id} (ADMIN)
updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category>

// DELETE /api/categories/{id} (ADMIN)
deleteCategory(id: number): Promise<void>
```

### 7.4 Cart API (`api/cartApi.ts`)
```typescript
// GET /api/carts
getCart(): Promise<CartResponse>

// POST /api/carts/add
addToCart(data: { productId: number; quantity: number }): Promise<CartResponse>

// PUT /api/carts/update
updateCartItem(data: { cartItemId: number; quantity: number }): Promise<CartResponse>

// DELETE /api/carts/remove/{cartItemId}
removeCartItem(cartItemId: number): Promise<CartResponse>

// DELETE /api/carts/clear
clearCart(): Promise<void>
```

### 7.5 Order API (`api/orderApi.ts`)
```typescript
// POST /api/orders hoặc /api/orders/checkout
createOrder(data: {
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'VNPAY';
  voucherId?: number;
}): Promise<OrderResponse>

// GET /api/orders/{orderId}
getOrder(orderId: number): Promise<OrderResponse>

// GET /api/orders/code/{orderCode}
getOrderByCode(orderCode: string): Promise<OrderResponse>

// GET /api/orders/my-orders?page=&size=
getMyOrders(params?: { page?: number; size?: number }): Promise<PaginatedResponse<OrderResponse>>

// PUT /api/orders/{orderId}/cancel
cancelOrder(orderId: number): Promise<OrderResponse>

// PUT /api/orders/{orderId}/status?status= (ADMIN)
updateOrderStatus(orderId: number, status: string): Promise<OrderResponse>
```

### 7.6 Wishlist API (`api/wishlistApi.ts`)
```typescript
// GET /api/wishlists
getWishlist(): Promise<WishlistItem[]>

// GET /api/wishlists/check/{productId}
checkWishlist(productId: number): Promise<boolean>

// GET /api/wishlists/count
getWishlistCount(): Promise<number>

// POST /api/wishlists/{productId}
addToWishlist(productId: number): Promise<void>

// DELETE /api/wishlists/{productId}
removeFromWishlist(productId: number): Promise<void>

// DELETE /api/wishlists
clearWishlist(): Promise<void>
```

### 7.7 Review API (`api/reviewApi.ts`)
```typescript
// GET /api/reviews/product/{productId}?page=&size=
getProductReviews(productId: number, params?: PaginationParams): Promise<PaginatedResponse<Review>>

// GET /api/reviews/product/{productId}/rating
getProductRating(productId: number): Promise<number>

// GET /api/reviews/product/{productId}/count
getProductReviewCount(productId: number): Promise<number>

// GET /api/reviews/my-reviews
getMyReviews(): Promise<Review[]>

// POST /api/reviews
createReview(data: { productId: number; rating: number; comment: string }): Promise<Review>

// PUT /api/reviews/{id}
updateReview(id: number, data: { rating: number; comment: string }): Promise<Review>

// DELETE /api/reviews/{id}
deleteReview(id: number): Promise<void>

// PUT /api/reviews/{id}/status (ADMIN)
updateReviewStatus(id: number, status: 'VISIBLE' | 'HIDDEN'): Promise<Review>
```

### 7.8 Voucher API (`api/voucherApi.ts`)
```typescript
// GET /api/vouchers?page=&size=
getVouchers(params?: PaginationParams): Promise<PaginatedResponse<Voucher>>

// GET /api/vouchers/{code}
getVoucherByCode(code: string): Promise<Voucher>

// POST /api/vouchers/validate
validateVoucher(data: { code: string; orderAmount: number }): Promise<{ discountAmount: number }>

// GET /api/vouchers/admin/all (ADMIN)
getAllVouchers(): Promise<Voucher[]>

// POST /api/vouchers (ADMIN)
createVoucher(data: CreateVoucherRequest): Promise<Voucher>

// PUT /api/vouchers/{id} (ADMIN)
updateVoucher(id: number, data: UpdateVoucherRequest): Promise<Voucher>

// DELETE /api/vouchers/{id} (ADMIN)
deleteVoucher(id: number): Promise<void>
```

### 7.9 Payment API (`api/paymentApi.ts`)
```typescript
// POST /api/payments/vnpay/create
createVnPayPayment(data: { orderId: number; returnUrl?: string }): Promise<{
  paymentUrl: string;
  amount: number;
  orderCode: string;
}>

// GET /api/payments/order/{orderId}
getPaymentByOrder(orderId: number): Promise<PaymentResponse>
```

### 7.10 User API (`api/userApi.ts`)
```typescript
// GET /api/users/profile
getProfile(): Promise<User>

// PUT /api/users/profile
updateProfile(data: { fullName?: string; phone?: string; address?: string }): Promise<User>

// GET /api/users (ADMIN)
getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>>

// PUT /api/users/{id}/status (ADMIN)
updateUserStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<User>

// DELETE /api/users/{id} (ADMIN)
deleteUser(id: number): Promise<void>
```

### 7.11 Recommendation API (`api/recommendationApi.ts`)
```typescript
// GET /api/recommendations/personalized?limit=
getPersonalized(limit?: number): Promise<ProductRecommendation[]>

// GET /api/recommendations/guest?limit=
getGuestRecommendations(limit?: number): Promise<ProductRecommendation[]>

// GET /api/recommendations/similar/{productId}?limit=
getSimilarProducts(productId: number, limit?: number): Promise<ProductRecommendation[]>

// GET /api/recommendations/trending?limit=
getTrending(limit?: number): Promise<ProductRecommendation[]>
```

### 7.12 Admin Stats API (`api/adminApi.ts`)
```typescript
// GET /api/admin/dashboard
getDashboard(): Promise<DashboardResponse>

// GET /api/admin/reports/revenue
getRevenueReport(): Promise<RevenueReport>

// GET /api/admin/reports/products
getProductReport(): Promise<ProductReport>

// GET /api/admin/reports/users
getUserReport(): Promise<UserReport>

// GET /api/admin/reports/orders
getOrderReport(): Promise<OrderReport>
```

### 7.13 File Upload API (`api/fileApi.ts`)
```typescript
// POST /api/files/products/images (multipart)
uploadProductImage(file: File): Promise<FileUploadResponse>

// POST /api/files/products/images/batch (multipart)
uploadProductImages(files: File[]): Promise<FileUploadResponse[]>

// POST /api/files/avatars (multipart)
uploadAvatar(file: File): Promise<FileUploadResponse>

// DELETE /api/files?fileUrl=
deleteFile(fileUrl: string): Promise<void>
```

---

## 8. Authentication & Authorization

### 8.1 Login Flow
1. User nhập email + password → call `POST /api/auth/login`
2. Nhận `{ accessToken, refreshToken, user }` → lưu vào Redux store + localStorage
3. Redirect về trang trước đó hoặc `/`
4. Axios interceptor tự gắn `Authorization: Bearer <accessToken>` vào mọi request

### 8.2 Register Flow
1. User nhập email, password, fullName, phone → call `POST /api/auth/register`
2. Nhận AuthResponse → tự động đăng nhập
3. Redirect về `/`

### 8.3 Token Refresh Flow (Tự động, trong Axios interceptor)
1. Request trả về 401 → interceptor bắt lấy
2. Call `POST /api/auth/refresh` với refreshToken từ localStorage
3. Nếu thành công → cập nhật accessToken → retry request gốc
4. Nếu thất bại → clear store + localStorage → redirect `/login`
5. **QUAN TRỌNG**: Dùng promise queue để tránh đồng thời gọi refresh nhiều lần

### 8.4 Google OAuth2 Flow
**Cách 1 — Redirect (Khuyến nghị)**:
1. Click "Đăng nhập với Google" → redirect tới `http://localhost:8080/login/oauth2/authorization/google`
2. User đăng nhập Google → backend xử lý → redirect về `http://localhost:3000/oauth-success?accessToken=...&refreshToken=...`
3. Trang `OAuthSuccess` parse tokens từ URL → lưu vào store → redirect `/`

**Cách 2 — Google One Tap / GSI**:
1. Dùng Google Identity Services SDK
2. Nhận `credential` (ID token) → decode lấy `googleId, email, fullName`
3. Call `POST /api/auth/google` → nhận AuthResponse

### 8.5 Forgot / Reset Password Flow
1. User nhập email → call `POST /api/auth/forgot-password` → nhận `resetToken`
2. (Production: token gửi qua email, dev: trả trực tiếp trong response)
3. User truy cập `/reset-password?token=xxx` → nhập mật khẩu mới
4. Call `POST /api/auth/reset-password` với `{ resetToken, newPassword }`
5. Thành công → redirect `/login` với thông báo

---

## 9. Các trang User (Customer)

### 9.1 Trang chủ (`/`) — `Home.tsx`
**Layout**:
- Hero banner/slider (ảnh quảng cáo)
- Danh mục nổi bật (grid icons/cards) → GET `/api/categories`
- Sản phẩm nổi bật → GET `/api/products/featured?size=8`
- Sản phẩm trending → GET `/api/recommendations/trending?limit=8`
- Gợi ý cá nhân hóa (nếu đã đăng nhập) → GET `/api/recommendations/personalized?limit=8`
- Voucher khuyến mãi hiện hành → GET `/api/vouchers?size=4`
- Footer

### 9.2 Cửa hàng (`/shop`) — `Shop.tsx`
**Layout**:
- Sidebar filter (hoặc top filter bar trên mobile):
  - Lọc theo danh mục (dropdown/checkbox tree)
  - Lọc theo khoảng giá (min-max slider hoặc input)
  - Lọc theo thương hiệu
- Sort: Mới nhất, Giá tăng, Giá giảm, Bán chạy, Đánh giá cao
- Product Grid (responsive: 4col desktop, 3 tablet, 2 mobile)
- Phân trang (hoặc Load More)

**API**: `GET /api/products?categoryId=&minPrice=&maxPrice=&keyword=&sortBy=price&sortDir=asc&page=0&size=12`

**Tính năng**:
- URL query params sync với filter state (cho phép chia sẻ link đã filter)
- Click category từ trang chủ → `/shop?category=ao-thun`
- Search bar → update `keyword` param
- Mỗi ProductCard hiển thị: ảnh, tên, giá gốc (gạch ngang nếu có sale), giá sale, rating stars, nút thêm wishlist

### 9.3 Chi tiết sản phẩm (`/product/:slug`) — `ProductDetail.tsx`
**Layout**:
- Breadcrumb: Home > Danh mục > Tên sản phẩm
- Image gallery (ảnh chính + thumbnails, có thể zoom/lightbox)
- Thông tin: tên, giá, giá sale (nếu có), mô tả, thương hiệu, trạng thái tồn kho
- Selector: số lượng (input number, min 1, max = stock)
- Buttons: "Thêm vào giỏ hàng", "Mua ngay", "Thêm vào yêu thích" (heart icon toggle)
- Tab/Section Reviews:
  - Rating trung bình + distribution (5★: xx%, 4★: xx%...)
  - Danh sách reviews (phân trang)
  - Form viết review (chỉ khi đã đăng nhập)
- Sản phẩm tương tự → GET `/api/recommendations/similar/{productId}?limit=6`

**API calls**:
- GET `/api/products/slug/{slug}` — thông tin sản phẩm
- GET `/api/reviews/product/{productId}?page=0&size=5` — reviews
- GET `/api/reviews/product/{productId}/rating` — rating trung bình
- GET `/api/wishlists/check/{productId}` — đã yêu thích chưa (nếu đã login)
- GET `/api/recommendations/similar/{productId}` — sản phẩm tương tự

### 9.4 Đăng nhập (`/login`) — `Login.tsx`
- Form: email + password
- Validation: email format, password min 6 ký tự
- Nút "Đăng nhập với Google" (OAuth2)
- Link: "Quên mật khẩu?", "Đăng ký tài khoản mới"
- Sau đăng nhập thành công: redirect về trang trước đó (dùng `location.state.from`)

### 9.5 Đăng ký (`/register`) — `Register.tsx`
- Form: email, password, confirm password, fullName, phone (optional)
- Validation: email unique (show error từ API), password match, fullName required
- Sau đăng ký thành công: tự động đăng nhập + redirect `/`

### 9.6 Quên mật khẩu (`/forgot-password`) — `ForgotPassword.tsx`
- Form: email
- Gửi request → hiển thị thông báo "Đã gửi link reset qua email"
- (Dev mode: hiển thị trực tiếp reset token)

### 9.7 Đặt lại mật khẩu (`/reset-password`) — `ResetPassword.tsx`
- Đọc `token` từ URL query params
- Form: new password + confirm password
- Thành công → redirect `/login`

### 9.8 OAuth Success (`/oauth-success`) — `OAuthSuccess.tsx`
- Parse `accessToken` và `refreshToken` từ URL query params
- Lưu vào Redux store + localStorage
- Redirect `/` (hoặc trang trước đó)
- Hiển thị loading spinner trong khi xử lý

### 9.9 Giỏ hàng (`/cart`) — `Cart.tsx`
**Layout**:
- Danh sách sản phẩm trong giỏ:
  - Ảnh, tên (link đến product detail), giá, quantity selector, subtotal
  - Nút xóa từng item
- Tóm tắt giỏ hàng (bên phải hoặc bottom trên mobile):
  - Tổng số lượng sản phẩm
  - Tổng tiền
  - Input nhập mã voucher → call validate → hiển thị giảm giá
  - Nút "Thanh toán" → redirect `/checkout`
- Nút "Xóa tất cả giỏ hàng"
- Empty state nếu giỏ trống (link tới `/shop`)

**API calls**:
- GET `/api/carts` — lấy giỏ hàng
- PUT `/api/carts/update` — cập nhật quantity
- DELETE `/api/carts/remove/{cartItemId}` — xóa item
- DELETE `/api/carts/clear` — xóa hết
- POST `/api/vouchers/validate` — kiểm tra voucher

### 9.10 Thanh toán (`/checkout`) — `Checkout.tsx`
**Layout**:
- Tóm tắt đơn hàng (danh sách items từ cart, tổng tiền)
- Form thông tin giao hàng:
  - Địa chỉ giao hàng (textarea, required)
  - Số điện thoại (input, required)
- Phương thức thanh toán:
  - COD (Thanh toán khi nhận hàng)
  - VNPay (Thanh toán online)
- Mã giảm giá (nếu chưa áp dụng ở giỏ hàng)
- Nút "Đặt hàng"

**Flow**:
1. User điền form → click "Đặt hàng"
2. Call `POST /api/orders` với `{ shippingAddress, phone, paymentMethod, voucherId? }`
3. Nhận OrderResponse
4. Nếu COD → redirect `/orders/{orderId}` + thông báo thành công
5. Nếu VNPay → call `POST /api/payments/vnpay/create` → nhận `paymentUrl` → redirect tới VNPay

### 9.11 Kết quả thanh toán (`/payment-result`) — `PaymentResult.tsx`
- VNPay redirect về URL này với query params chứa kết quả
- Parse query params: `vnp_ResponseCode`, `vnp_TxnRef`, `vnp_Amount`...
- Nếu `vnp_ResponseCode === '00'` → thanh toán thành công → hiển thị chi tiết đơn hàng
- Nếu thất bại → hiển thị lỗi + nút thử lại
- Link tới chi tiết đơn hàng

### 9.12 Danh sách đơn hàng (`/orders`) — `Orders.tsx`
- Bảng/list các đơn hàng: mã đơn, ngày, trạng thái (badge màu), tổng tiền, số sản phẩm
- Status badges: PENDING (vàng), PAID (xanh dương), SHIPPING (tím), DELIVERED (xanh lá), CANCELLED (đỏ)
- Click vào đơn → xem chi tiết
- Phân trang
- Nút hủy đơn (chỉ khi status PENDING)

**API**: GET `/api/orders/my-orders?page=0&size=10`

### 9.13 Chi tiết đơn hàng (`/orders/:id`) — `OrderDetail.tsx`
- Mã đơn hàng, trạng thái, ngày đặt
- Timeline/stepper trạng thái (PENDING → PAID → SHIPPING → DELIVERED)
- Danh sách sản phẩm: ảnh, tên, số lượng, giá, subtotal
- Thông tin giao hàng: địa chỉ, SĐT
- Phương thức thanh toán
- Tổng tiền (hiển thị giảm giá nếu dùng voucher)
- Nút "Hủy đơn" (nếu status PENDING)

### 9.14 Danh sách yêu thích (`/wishlist`) — `Wishlist.tsx`
- Grid sản phẩm (tương tự Shop nhưng chỉ items đã yêu thích)
- Mỗi card: ảnh, tên, giá, nút xóa khỏi wishlist, nút thêm vào giỏ
- Empty state nếu chưa có sản phẩm nào
- Nút "Xóa tất cả"

**API**: GET `/api/wishlists`

### 9.15 Thông tin cá nhân (`/profile`) — `Profile.tsx`
- Hiển thị thông tin: email (readonly), fullName, phone, address
- Avatar (ảnh đại diện) + upload mới
- Form cập nhật thông tin
- Section đổi mật khẩu (nếu không phải OAuth user)

**API**:
- GET `/api/users/profile`
- PUT `/api/users/profile`
- POST `/api/files/avatars` (upload avatar)

### 9.16 Danh sách voucher (`/vouchers`) — `Vouchers.tsx`
- Grid/list voucher đang hoạt động
- Mỗi voucher card: mã, loại giảm (% hoặc số tiền), giá trị, đơn tối thiểu, hạn sử dụng
- Nút "Sao chép mã" (copy to clipboard)
- Badge nếu sắp hết hạn

**API**: GET `/api/vouchers`

---

## 10. Các trang Admin

> Tất cả trang Admin sử dụng `AdminLayout` riêng với sidebar navigation.

### 10.1 Admin Layout
- Sidebar trái (collapsible): Dashboard, Sản phẩm, Danh mục, Đơn hàng, Khách hàng, Voucher, Reviews, Báo cáo
- Header: tên admin, avatar, nút logout
- Main content area
- Responsive: sidebar thành hamburger menu trên mobile

### 10.2 Dashboard (`/admin/dashboard`) — `admin/Dashboard.tsx`
- Cards thống kê: Tổng đơn hàng, Tổng doanh thu, Tổng khách hàng, Tổng sản phẩm, Tỷ lệ chuyển đổi
- Biểu đồ doanh thu theo tháng (Line Chart — Recharts)
- Biểu đồ phân bố trạng thái đơn hàng (Pie Chart)
- Biểu đồ doanh thu theo phương thức thanh toán (Bar Chart)
- Top 5 sản phẩm bán chạy (Table)
- Đơn hàng gần đây (Table, 5 đơn mới nhất)

**API**: GET `/api/admin/dashboard`, GET `/api/admin/reports/revenue`, GET `/api/admin/reports/orders`

### 10.3 Quản lý sản phẩm (`/admin/products`) — `admin/ProductManagement.tsx`
- Table danh sách sản phẩm: ảnh, tên, giá, sale price, stock, category, status, actions
- Search bar + filter theo category, status
- Nút "Thêm sản phẩm" → mở Modal/Form
- Form tạo/sửa sản phẩm:
  - Input: name, slug (auto-generate từ name), description (rich text hoặc textarea)
  - Input: price, salePrice, stock, brand
  - Select: category (dropdown tree)
  - Upload ảnh: drag & drop hoặc click, hỗ trợ nhiều ảnh, preview
  - Nút submit
- Actions: Edit, Delete (confirm dialog)
- Phân trang

### 10.4 Quản lý danh mục (`/admin/categories`) — `admin/CategoryManagement.tsx`
- Hiển thị dạng tree (parent → children)
- Nút "Thêm danh mục"
- Form: name, slug, description, imageUrl, parentId (select parent)
- Actions: Edit, Delete (cảnh báo nếu có sản phẩm)
- Drag & drop reorder (optional/nice-to-have)

### 10.5 Quản lý đơn hàng (`/admin/orders`) — `admin/OrderManagement.tsx`
- Table: mã đơn, khách hàng, tổng tiền, trạng thái, phương thức TT, ngày đặt
- Filter: theo trạng thái (tabs hoặc dropdown)
- Click vào đơn → expand chi tiết (accordion) hoặc modal
- Dropdown cập nhật trạng thái: PENDING → PAID → SHIPPING → DELIVERED / CANCELLED
- Phân trang

### 10.6 Quản lý khách hàng (`/admin/customers`) — `admin/CustomerManagement.tsx`
- Table: email, tên, SĐT, role, status, ngày đăng ký
- Search theo email/tên
- Toggle status ACTIVE/INACTIVE
- Xem chi tiết (đơn hàng, reviews của KH)
- Phân trang

### 10.7 Quản lý voucher (`/admin/vouchers`) — `admin/VoucherManagement.tsx`
- Table: code, loại giảm, giá trị, đơn tối thiểu, giảm tối đa, số lượng, thời hạn, status
- Nút "Tạo voucher"
- Form: code, discountType (select), discountValue, minOrderValue, maxDiscount, quantity, startDate (datepicker), endDate (datepicker)
- Actions: Edit, Delete
- Badge: "Đang hoạt động", "Hết hạn", "Hết lượt dùng"

### 10.8 Quản lý reviews (`/admin/reviews`) — `admin/ReviewManagement.tsx`
- Table: sản phẩm, user, rating (stars), comment (truncated), status, ngày
- Filter: theo status (VISIBLE/HIDDEN)
- Toggle ẩn/hiện review
- Quick preview comment (expand)

### 10.9 Báo cáo (`/admin/reports`) — `admin/Reports.tsx`
- Tab Doanh thu: biểu đồ line chart theo tháng, tổng doanh thu, top Categories
- Tab Sản phẩm: top bán chạy, sản phẩm hết hàng, sản phẩm xem nhiều
- Tab Khách hàng: tổng KH, KH mới theo tháng, KH hoạt động
- Tab Đơn hàng: phân bố status, payment method breakdown

---

## 11. Shared Components

### 11.1 UI Components
| Component | Props | Mô tả |
|-----------|-------|--------|
| `Button` | `variant, size, loading, disabled, onClick` | Primary, secondary, outline, danger variants |
| `Input` | `label, error, type, placeholder, register` | Tích hợp React Hook Form |
| `Select` | `label, options, error, register` | Dropdown select |
| `Modal` | `isOpen, onClose, title, children` | Dialog overlay |
| `Badge` | `variant, children` | Status badges (success, warning, danger, info) |
| `Skeleton` | `width, height, className` | Loading placeholder |
| `Spinner` | `size` | Loading spinner |
| `Avatar` | `src, alt, size` | User avatar (fallback initials) |
| `Tooltip` | `content, children` | Hover tooltip |
| `ConfirmDialog` | `isOpen, onConfirm, onCancel, message` | Xác nhận hành động nguy hiểm |

### 11.2 Layout Components
| Component | Mô tả |
|-----------|--------|
| `Header` | Logo, search bar, nav links, cart icon (badge count), user menu, wishlist icon |
| `Footer` | Links, copyright, social icons |
| `AdminSidebar` | Navigation menu cho admin pages |
| `AdminLayout` | Sidebar + Header + Content wrapper |
| `UserLayout` | Header + Content + Footer wrapper |

### 11.3 Product Components
| Component | Props | Mô tả |
|-----------|-------|--------|
| `ProductCard` | `product, onAddToCart, onToggleWishlist` | Card hiển thị sản phẩm trong grid |
| `ProductGrid` | `products, loading` | Grid layout responsive |
| `ProductGallery` | `images` | Image gallery với zoom/lightbox |
| `PriceDisplay` | `price, salePrice` | Hiển thị giá (gạch ngang giá gốc nếu có sale) |

### 11.4 Common Components
| Component | Mô tả |
|-----------|--------|
| `Pagination` | Phân trang với page numbers |
| `SearchBar` | Input search với debounce |
| `Breadcrumb` | Navigation breadcrumb |
| `EmptyState` | Trạng thái rỗng (icon + message + CTA) |
| `StarRating` | Hiển thị + input rating 1-5 stars |
| `QuantitySelector` | Input tăng/giảm số lượng |
| `FilterSidebar` | Sidebar lọc sản phẩm |
| `SortDropdown` | Dropdown chọn cách sắp xếp |

---

## 12. Responsive Design & UI/UX

### 12.1 Breakpoints (Tailwind defaults)
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### 12.2 Responsive Requirements
- **Mobile first**: Design cho mobile trước, scale up
- **Header**: collapse nav thành hamburger menu ở `< md`
- **Product Grid**: 2 cột mobile → 3 cột tablet → 4 cột desktop
- **Sidebar filter**: bottom sheet hoặc drawer ở mobile
- **Admin sidebar**: collapsible drawer ở mobile
- **Cart**: stacked layout ở mobile, side-by-side ở desktop
- **Tables** (Admin): horizontal scroll ở mobile, hoặc card view

### 12.3 UI/UX Guidelines
- **Color scheme**: Thời trang, thanh lịch (gợi ý: đen-trắng-vàng gold, hoặc navy-white)
- **Font**: Inter hoặc Nunito (Google Fonts)
- **Animations**: subtle fade/slide transitions khi chuyển trang, hover effects trên cards
- **Loading states**: Skeleton placeholders thay vì spinner cho lists/grids
- **Toast notifications**: Thành công (xanh), Lỗi (đỏ), Cảnh báo (vàng)
- **Image lazy loading**: Dùng `loading="lazy"` hoặc Intersection Observer
- **Optimistic UI**: Cập nhật UI trước rồi sync API (ví dụ: toggle wishlist)

---

## 13. Tích hợp thanh toán VNPay

### 13.1 Flow
```
1. User chọn VNPay ở checkout → click "Đặt hàng"
2. Frontend gọi POST /api/orders (tạo đơn với paymentMethod: VNPAY)
3. Nhận orderId → gọi POST /api/payments/vnpay/create { orderId }
4. Nhận { paymentUrl } → window.location.href = paymentUrl (redirect tới VNPay)
5. User thanh toán trên trang VNPay
6. VNPay redirect về http://localhost:3000/payment-result?vnp_ResponseCode=00&...
7. Frontend parse params → hiển thị kết quả
   - Success (00): "Thanh toán thành công!" + hiển thị chi tiết đơn
   - Failed: "Thanh toán thất bại" + nút thử lại
```

### 13.2 PaymentResult Page Logic
```typescript
const params = new URLSearchParams(window.location.search);
const responseCode = params.get('vnp_ResponseCode');
const txnRef = params.get('vnp_TxnRef');
const amount = params.get('vnp_Amount');

if (responseCode === '00') {
  // Thanh toán thành công
  // Fetch order details để hiển thị
} else {
  // Thanh toán thất bại
  // Hiển thị error message dựa trên responseCode
}
```

---

## 14. Tích hợp Google OAuth2

### 14.1 Cách tích hợp (Redirect-based — Khuyến nghị)
```typescript
const handleGoogleLogin = () => {
  // Redirect tới backend OAuth endpoint
  window.location.href = `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/oauth2/authorization/google`;
};
```

### 14.2 OAuthSuccess Page
```typescript
// URL: /oauth-success?accessToken=xxx&refreshToken=yyy
const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Decode JWT để lấy user info (hoặc call GET /api/users/profile)
      dispatch(setCredentials({ accessToken, refreshToken }));
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return <LoadingSpinner />;
};
```

---

## 15. Error Handling & Loading States

### 15.1 Global Error Handling
- **Axios interceptor**: Catch tất cả API errors
  - 400: Hiển thị validation errors từ response body
  - 401: Token expired → auto refresh hoặc logout
  - 403: "Bạn không có quyền thực hiện hành động này"
  - 404: "Không tìm thấy dữ liệu"
  - 409: "Dữ liệu đã tồn tại" (ví dụ: email trùng)
  - 500: "Đã xảy ra lỗi, vui lòng thử lại sau"
- **Error Boundary**: Component React bắt lỗi render → hiển thị fallback UI

### 15.2 Loading States
- **Page load**: Full-page skeleton
- **List/Grid**: Skeleton cards (6-12 items)
- **Button actions**: Button disabled + spinner icon
- **Form submit**: Button loading state + disable inputs
- **Pagination**: Smooth transition (fade out → fade in)

### 15.3 Empty States
- Giỏ hàng trống: icon giỏ hàng + "Giỏ hàng của bạn đang trống" + nút "Mua sắm ngay"
- Wishlist trống: icon trái tim + "Chưa có sản phẩm yêu thích"
- Không có kết quả tìm kiếm: icon search + "Không tìm thấy sản phẩm phù hợp"
- Chưa có đơn hàng: icon đơn hàng + "Bạn chưa có đơn hàng nào"

---

## 16. Testing

> **YÊU CẦU BẮT BUỘC**: Test kỹ lưỡng TẤT CẢ chức năng frontend trước khi commit.

### 16.1 Unit Tests (Vitest + React Testing Library)

**Cần test cho mỗi component**:

#### A. Auth Tests
- [ ] Login form: validation, submit thành công, submit thất bại, hiển thị lỗi
- [ ] Register form: validation, password match, submit thành công
- [ ] ForgotPassword: gửi email, hiển thị thông báo
- [ ] ResetPassword: validation, submit thành công
- [ ] OAuthSuccess: parse tokens, redirect
- [ ] Token refresh logic: auto refresh khi 401, queue concurrent refreshes

#### B. Product Tests
- [ ] ProductCard: render đúng thông tin, click events
- [ ] ProductGrid: render danh sách, loading skeleton
- [ ] ProductDetail: render thông tin, gallery, reviews, add to cart, toggle wishlist
- [ ] Shop page: filter, sort, search, pagination, URL sync
- [ ] Featured products: render đúng trên trang chủ

#### C. Cart Tests
- [ ] Thêm sản phẩm vào giỏ (từ ProductDetail + ProductCard)
- [ ] Cập nhật số lượng (tăng/giảm/nhập trực tiếp)
- [ ] Xóa từng item
- [ ] Xóa toàn bộ giỏ hàng
- [ ] Tính tổng tiền đúng
- [ ] Áp dụng voucher: hợp lệ, không hợp lệ, hết hạn

#### D. Order Tests
- [ ] Checkout flow: COD + VNPay
- [ ] Validation form checkout (địa chỉ, SĐT required)
- [ ] Danh sách đơn hàng: phân trang, hiển thị status đúng
- [ ] Chi tiết đơn hàng: timeline trạng thái
- [ ] Hủy đơn: chỉ khi PENDING, confirm dialog

#### E. Wishlist Tests
- [ ] Toggle wishlist (thêm/xóa)
- [ ] Danh sách wishlist
- [ ] Xóa hết
- [ ] Kiểm tra trạng thái heart icon sync đúng

#### F. Review Tests
- [ ] Viết review: rating + comment
- [ ] Xem reviews: phân trang
- [ ] Cập nhật review (chỉ chủ sở hữu)
- [ ] Xóa review (chỉ chủ sở hữu)
- [ ] Rating trung bình hiển thị đúng

#### G. Voucher Tests
- [ ] Danh sách voucher
- [ ] Copy mã voucher
- [ ] Validate tại cart/checkout

#### H. User Profile Tests
- [ ] Xem profile
- [ ] Cập nhật profile
- [ ] Upload avatar

#### I. Admin Tests
- [ ] Dashboard: render cards + charts với mock data
- [ ] CRUD Products: create, edit, delete, upload ảnh
- [ ] CRUD Categories: create, edit, delete, tree view
- [ ] Order Management: update status, filter
- [ ] Customer Management: toggle status, search
- [ ] CRUD Vouchers: create, edit, delete, date validation
- [ ] Review Management: toggle status
- [ ] Reports: render charts

#### J. Navigation & Routing Tests
- [ ] PrivateRoute: redirect khi chưa đăng nhập
- [ ] AdminRoute: redirect khi không phải admin
- [ ] GuestRoute: redirect khi đã đăng nhập
- [ ] 404 page

### 16.2 E2E Tests (Playwright)

**Critical user flows cần E2E test**:

```
tests/
├── e2e/
│   ├── auth.spec.ts           # Login, register, logout, OAuth
│   ├── shopping-flow.spec.ts  # Browse → Add to cart → Checkout → Order
│   ├── product-browse.spec.ts # Search, filter, sort, pagination
│   ├── cart.spec.ts           # Add, update, remove, voucher
│   ├── wishlist.spec.ts       # Add, remove, view
│   ├── profile.spec.ts        # View, update
│   ├── admin-products.spec.ts # CRUD products
│   ├── admin-orders.spec.ts   # Manage orders
│   └── responsive.spec.ts     # Mobile/tablet/desktop layouts
```

### 16.3 Test Commands
```bash
# Unit tests
npm run test              # Chạy tất cả unit tests
npm run test:coverage     # Chạy với code coverage report

# E2E tests  
npm run test:e2e          # Chạy Playwright tests
npm run test:e2e:ui       # Chạy với Playwright UI mode
```

### 16.4 Coverage Requirements
- **Tối thiểu 70% code coverage** cho unit tests
- **Tất cả critical flows** phải có E2E tests
- **Tất cả form validations** phải được test
- **Tất cả error states** phải được test
- **Tất cả loading states** phải được test

---

## 17. CI/CD Pipeline

> **YÊU CẦU BẮT BUỘC**: Tạo file `.github/workflows/frontend-ci.yml`

### 17.1 Frontend CI Workflow

```yaml
# .github/workflows/frontend-ci.yml
name: Fashion Shop Frontend CI

on:
  push:
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-test:
    name: Unit Tests
    runs-on: ubuntu-latest
    needs: lint
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: frontend/coverage/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: unit-test
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: frontend/dist/

  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: build
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

### 17.2 Cấu hình `package.json` scripts cần có
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 18. Quy trình commit & PR

### 18.1 Quy trình commit

> **YÊU CẦU BẮT BUỘC**: Mỗi commit PHẢI có message liệt kê TẤT CẢ thay đổi chi tiết.

**Format commit message**:
```
<type>(<scope>): <tiêu đề ngắn gọn>

Các thay đổi chi tiết:
- <mô tả thay đổi 1>
- <mô tả thay đổi 2>
- <mô tả thay đổi 3>
...
```

**Commit types**:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `style`: CSS/UI changes
- `refactor`: Tái cấu trúc code
- `test`: Thêm/sửa tests
- `ci`: CI/CD changes
- `docs`: Documentation
- `chore`: Cập nhật dependencies, configs

**Ví dụ**:
```
feat(auth): Implement login, register, and OAuth2 authentication

Các thay đổi chi tiết:
- Tạo Login.tsx với form email/password và validation bằng Zod
- Tạo Register.tsx với form đăng ký và kiểm tra password match
- Tạo ForgotPassword.tsx gửi email reset password
- Tạo ResetPassword.tsx nhận token từ URL và đặt mật khẩu mới
- Tạo OAuthSuccess.tsx xử lý redirect từ Google OAuth2
- Implement authApi.ts với tất cả auth endpoints
- Implement authSlice.ts (Redux) quản lý state đăng nhập
- Implement useAuth.ts custom hook
- Cấu hình Axios interceptor cho token refresh tự động
- Tạo PrivateRoute, AdminRoute, GuestRoute components
- Thêm Google login button với redirect flow
- Xử lý concurrent token refresh với promise queue
- Thêm unit tests cho tất cả auth components
- Thêm E2E test cho login/register flow
```

### 18.2 Thứ tự commit gợi ý

1. **`chore(init): Initialize frontend project with Vite + React + TypeScript`**
   - Khởi tạo project, cài dependencies, cấu hình Tailwind, Vite, ESLint, TypeScript

2. **`feat(layout): Create shared layout components and UI system`**
   - Header, Footer, AdminLayout, Button, Input, Modal, Badge, etc.

3. **`feat(types): Define TypeScript interfaces cho tất cả entities`**
   - Tất cả types + API service layer (axiosInstance + tất cả API files)

4. **`feat(auth): Implement authentication system`**
   - Login, Register, Forgot/Reset Password, OAuth2, Redux auth slice, route guards

5. **`feat(home): Build homepage with featured products and categories`**
   - Hero banner, categories grid, featured products, recommendations

6. **`feat(shop): Build shop page with filter, sort, search, pagination`**
   - Product listing, filter sidebar, sort, URL sync, responsive grid

7. **`feat(product): Build product detail page`**
   - Gallery, info, add to cart, wishlist, reviews section, similar products

8. **`feat(cart): Implement shopping cart`**
   - Cart page, add/update/remove items, voucher validation, cart badge in header

9. **`feat(checkout): Implement checkout and VNPay integration`**
   - Checkout form, COD/VNPay selection, payment redirect, PaymentResult page

10. **`feat(orders): Build order management pages`**
    - Orders list, order detail, cancel order, status timeline

11. **`feat(wishlist): Implement wishlist functionality`**
    - Wishlist page, toggle from product cards/detail, sync state

12. **`feat(profile): Build user profile page`**
    - Profile info, edit, avatar upload

13. **`feat(admin): Build admin dashboard and statistics`**
    - Dashboard cards, charts, reports tabs

14. **`feat(admin): Build admin CRUD pages`**
    - Product, Category, Order, Customer, Voucher, Review management

15. **`test(frontend): Add comprehensive unit tests`**
    - Tests cho tất cả components, hooks, utils, API calls

16. **`test(e2e): Add Playwright E2E tests`**
    - E2E cho tất cả critical user flows

17. **`ci(frontend): Add CI/CD pipeline for PR testing`**
    - `.github/workflows/frontend-ci.yml`

### 18.3 Trước mỗi commit, kiểm tra

- [ ] `npm run lint` — không có lỗi lint
- [ ] `npm run type-check` — không có lỗi TypeScript
- [ ] `npm run test` — tất cả unit tests pass
- [ ] `npm run build` — build thành công không lỗi
- [ ] Test manual trên trình duyệt (responsive check)
- [ ] Kiểm tra tất cả error states hoạt động đúng
- [ ] Kiểm tra tất cả loading states hiển thị đúng
- [ ] Kiểm tra tất cả form validations đúng

---

## 19. API Reference đầy đủ

### 19.1 Authentication Response Format
```typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // milliseconds (3600000 = 1h)
  user: {
    id: number;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
  };
}
```

### 19.2 Paginated Response Format
```typescript
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-based)
  first: boolean;
  last: boolean;
}
```

### 19.3 Product Response
```typescript
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brand: string;
  imageUrl: string;
  images: ProductImage[];
  views: number;
  averageRating: number;
  reviewCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string; // ISO 8601
}

interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}
```

### 19.4 Category Response
```typescript
interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  parentId: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
```

### 19.5 Cart Response
```typescript
interface CartResponse {
  id: number;
  userId: number;
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  status: 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';
  createdAt: string;
}

interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  priceAtAdd: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}
```

### 19.6 Order Response
```typescript
interface OrderResponse {
  id: number;
  orderCode: string; // format: ORD-YYYYMMDD-XXXXXX
  userId: number;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  phone: string;
  paymentMethod: 'COD' | 'VNPAY';
  voucherId: number | null;
  itemCount: number;
  createdAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}
```

### 19.7 Review Response
```typescript
interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number; // 1-5
  comment: string;
  status: 'VISIBLE' | 'HIDDEN';
  createdAt: string;
}
```

### 19.8 Voucher Response
```typescript
interface Voucher {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'AMOUNT';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  quantity: number; // 0 = unlimited
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}
```

### 19.9 Payment Response
```typescript
interface PaymentResponse {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  paymentMethod: 'VNPAY' | 'COD';
  vnpTxnRef: string | null;
  createdAt: string;
  paidAt: string | null;
}
```

### 19.10 User Response
```typescript
interface User {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  googleId: string | null;
  oauthProvider: 'EMAIL' | 'GOOGLE' | 'GITHUB';
  createdAt: string;
}
```

### 19.11 Dashboard Response
```typescript
interface DashboardResponse {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  conversionRate: number;
  orderStatusDistribution: Record<string, number>;
  revenueByPaymentMethod: Record<string, number>;
}
```

### 19.12 File Upload Response
```typescript
interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  status: string;
}
```

### 19.13 Recommendation Response
```typescript
interface ProductRecommendation {
  id: number;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  effectivePrice: number;
  imageUrl: string;
  rating: number;
  views: number;
}
```

---

## CHECKLIST TỔNG HỢP

### Trước khi bắt đầu
- [ ] Đọc hiểu toàn bộ tài liệu này
- [ ] Backend đang chạy ở `localhost:8080`
- [ ] MySQL đang chạy với database `fashion_shop`
- [ ] Có thể gọi API từ Postman/curl thành công

### Frontend cần hoàn thành
- [ ] Khởi tạo project Vite + React + TypeScript + Tailwind
- [ ] Cấu hình Axios, Redux, Router
- [ ] TypeScript types cho tất cả entities
- [ ] API service layer đầy đủ 13 modules
- [ ] Authentication system (Login, Register, OAuth2, Token Refresh)
- [ ] Route guards (Private, Admin, Guest)
- [ ] 16 trang User + 8 trang Admin = 24 trang
- [ ] 30+ shared components
- [ ] Responsive trên mọi breakpoint
- [ ] Error handling + Loading states + Empty states
- [ ] VNPay payment integration
- [ ] Google OAuth2 integration
- [ ] Unit tests coverage >= 70%
- [ ] E2E tests cho tất cả critical flows
- [ ] CI/CD pipeline chạy khi mở PR
- [ ] Tất cả lint + type-check pass
- [ ] Build production thành công
- [ ] Commit messages liệt kê chi tiết tất cả thay đổi
