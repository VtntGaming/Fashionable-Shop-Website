# Frontend TODO - Fashionable Shop Website

## Cấu trúc thư mục

```
frontend/src/
├── api/               # 13 API services + axiosInstance
├── components/
│   ├── common/        # EmptyState, Pagination, RouteGuards, StarRating
│   ├── layout/        # Header, Footer, UserLayout, AdminLayout
│   ├── product/       # ProductCard
│   └── ui/            # ImageWithFallback, LoadingSpinner
├── hooks/             # useCart
├── pages/
│   ├── admin/         # 8 trang admin
│   │   ├── Dashboard.tsx
│   │   ├── ProductManagement.tsx
│   │   ├── CategoryManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── CustomerManagement.tsx
│   │   ├── VoucherManagement.tsx
│   │   ├── ReviewManagement.tsx
│   │   └── Reports.tsx
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Orders.tsx
│   ├── OrderDetail.tsx
│   ├── Wishlist.tsx
│   ├── Vouchers.tsx
│   ├── Profile.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── OAuthSuccess.tsx
│   ├── PaymentResult.tsx
│   └── NotFound.tsx
├── store/             # Redux (authSlice, cartSlice)
├── types/             # 10 type files
├── utils/             # formatCurrency, formatDate, constants
├── App.tsx            # Routes config
├── main.tsx           # Entry point
└── index.css          # Tailwind + @theme + fonts
```

---

## BUG - Lỗi cần sửa ngay

### [B1] Cart item link sai đường dẫn
- **File:** `Cart.tsx` dòng ~60
- **Vấn đề:** `<Link to="/shop">` - ảnh sản phẩm link về `/shop` thay vì `/product/:slug`
- **Fix:** Đổi thành `<Link to={"/product/" + item.productSlug}>`

### [B2] Admin order detail route thiếu
- **File:** `App.tsx`, `OrderManagement.tsx`
- **Vấn đề:** Admin order management link tới `/admin/orders/:id` nhưng route này không tồn tại trong App.tsx
- **Fix:** Thêm route `<Route path="orders/:id" element={<OrderDetail />} />` trong admin routes

### [B3] Header admin link path không khớp
- **File:** `Header.tsx`
- **Vấn đề:** Link đến `/admin/dashboard` nhưng route config dùng `<Route index>` tức là path `/admin`
- **Fix:** Đổi link thành `/admin`

### [B4] useEffect thiếu dependency
- **File:** `Cart.tsx`, `Checkout.tsx`, nhiều trang khác
- **Vấn đề:** `useEffect(() => { fetchCart(); }, [])` - `fetchCart` không có trong dependency array
- **Ảnh hưởng:** ESLint warning, có thể miss state update

### [B5] Không scroll to top khi chuyển trang
- **Vấn đề:** Khi navigate giữa các route, trang không scroll về đầu
- **Fix:** Thêm `ScrollToTop` component dùng `useLocation` + `useEffect`

---

## LAYOUT - Vấn đề bố cục

### [L1] Header - Mobile UX
- Search bar ẩn trên mobile, cần thêm vào mobile menu hoặc tạo expandable search
- User dropdown không có animation, xuất hiện đột ngột
- Thiếu active state cho nav link hiện tại (không biết đang ở trang nào)

### [L2] Footer - Responsive
- 4-column grid có thể quá chật trên tablet (md)
- Thiếu social media links/icons
- Link "Hỗ trợ" section có text cứng, nên link thực sự

### [L3] UserLayout - Thiếu breadcrumb global
- Chỉ có ProductDetail và OrderDetail có breadcrumb riêng
- Các trang khác không có breadcrumb → user không biết mình đang ở đâu

### [L4] AdminLayout - Sidebar trên mobile
- Sidebar overlay mobile hoạt động nhưng thiếu animation slide-in
- Không có transition cho sidebar open/close
- Active menu item chỉ so sánh exact path, sub-routes không highlight parent

### [L5] Card border quá nhẹ
- Hầu hết card dùng `border-gray-100` → gần như vô hình trên nền trắng
- Nên đổi thành `border-gray-200` hoặc thêm subtle shadow

---

## DESIGN - Cải thiện thiết kế

### [D1] Home - Hero Banner
- **Hiện tại:** Gradient đơn giản, text + 1 nút
- **Cải thiện:**
  - [ ] Thêm hero image/illustration bên phải
  - [ ] Thêm animation fade-in cho text
  - [ ] Thêm counter stats (e.g. "1000+ sản phẩm", "500+ đánh giá")
  - [ ] Responsive: text center trên mobile

### [D2] Home - Category Section
- **Hiện tại:** Grid ảnh vuông + tên
- **Cải thiện:**
  - [ ] Thêm overlay gradient trên ảnh với tên category
  - [ ] Hover effect: scale + shadow
  - [ ] Thêm icon mặc định khi không có ảnh

### [D3] ProductCard - Thiết kế tốt hơn
- **Hiện tại:** Ảnh + tên + giá + nút
- **Cải thiện:**
  - [ ] Hover elevation (shadow-md on hover)
  - [ ] Quick view overlay button
  - [ ] Wishlist heart icon ở góc trên
  - [ ] Transition mượt mà hơn cho tất cả hover states
  - [ ] Tag "Mới" cho sản phẩm mới

### [D4] Shop - Filter Sidebar
- **Hiện tại:** Category buttons + price inputs
- **Cải thiện:**
  - [ ] Collapse/expand sections
  - [ ] Price range slider thay vì 2 input
  - [ ] Active filter summary (chips)
  - [ ] Clear all filters button
  - [ ] Brand filter
  - [ ] Rating filter

### [D5] ProductDetail - Gallery
- **Hiện tại:** Main image + thumbnail strip
- **Cải thiện:**
  - [ ] Zoom on hover
  - [ ] Lightbox modal khi click
  - [ ] Image carousel/slider cho mobile
  - [ ] Dots indicator

### [D6] Login / Register - Thiết kế hiện đại hơn
- **Hiện tại:** Card trắng centered, khá đơn giản
- **Cải thiện:**
  - [ ] Split layout: hình minh họa bên trái, form bên phải
  - [ ] Hoặc: background gradient/image
  - [ ] Password strength indicator cho Register
  - [ ] "Show password" toggle

### [D7] Cart - UI chi tiết hơn
- **Hiện tại:** List items + summary sidebar
- **Cải thiện:**
  - [ ] Ảnh sản phẩm lớn hơn (hiện w-20 h-20)
  - [ ] Hiển thị giá gốc (gạch) và giá sale
  - [ ] Link sản phẩm đúng slug (xem bug B1)
  - [ ] Animation khi remove/update quantity
  - [ ] Skeleton loading cho từng item

### [D8] Orders - Timeline rõ ràng hơn
- **Hiện tại:** OrderDetail có timeline nhưng styling basic
- **Cải thiện:**
  - [ ] Timeline dọc thay vì ngang (responsive hơn)
  - [ ] Icon cho từng status step
  - [ ] Ngày giờ cho mỗi step (nếu backend hỗ trợ)

### [D9] Profile - Avatar & Tab
- **Hiện tại:** Avatar upload + 2 tabs
- **Cải thiện:**
  - [ ] Avatar preview lớn hơn với crop
  - [ ] Tab UI rõ ràng hơn (pill tabs hoặc underline style)
  - [ ] Thêm section "Lịch sử mua hàng gần đây"

### [D10] Vouchers - Card design
- **Hiện tại:** Gradient card với code + copy button
- **Cải thiện:**
  - [ ] Dạng coupon ticket (hình dấu đục lỗ 2 bên)
  - [ ] Progress bar cho remaining usage
  - [ ] Countdown timer cho voucher sắp hết hạn
  - [ ] Toast xác nhận khi copy thành công

### [D11] Admin Dashboard - Charts & Stats
- **Hiện tại:** 4 stat cards + 2 charts
- **Cải thiện:**
  - [ ] Cards thêm trend indicator (mũi tên lên/xuống + %)
  - [ ] Thêm recent orders list
  - [ ] Thêm top selling products chart
  - [ ] Date range picker cho filter
  - [ ] Mini sparkline trong mỗi stat card

### [D12] Admin Tables - Chung
- **Hiện tại:** Basic table với border subtle
- **Cải thiện:**
  - [ ] Row hover highlight rõ hơn
  - [ ] Zebra striping hoặc separator lines rõ hơn
  - [ ] Responsive: card view thay vì table trên mobile
  - [ ] Bulk actions (select multiple)
  - [ ] Confirm dialog styled (thay vì browser confirm)

---

## UX - Cải thiện trải nghiệm

### [U1] Loading States
- [ ] Skeleton loading cho tất cả trang (hiện chỉ Home dùng SkeletonGrid)
- [ ] Button loading state thống nhất (spinner + disabled)
- [ ] Optimistic updates cho cart operations

### [U2] Error Handling
- [ ] Error boundary cho lazy-loaded routes (hiện chỉ có Suspense)
- [ ] Retry button khi fetch thất bại
- [ ] Offline indicator

### [U3] Animations
- [ ] Page transitions (framer-motion hoặc CSS)
- [ ] Card list appear staggered animation
- [ ] Modal open/close animation
- [ ] Sidebar slide animation (admin mobile)
- [ ] Toast entrance animation (react-hot-toast đã hỗ trợ)

### [U4] Accessibility
- [ ] Focus ring styles cho keyboard navigation
- [ ] aria-label cho icon-only buttons
- [ ] Skip navigation link
- [ ] Form field association (label htmlFor)
- [ ] Color contrast check cho text-gray-500 trên nền trắng

### [U5] SEO & Meta
- [ ] Document title per page (react-helmet hoặc useEffect)
- [ ] Meta description
- [ ] Open Graph tags

---

## PERFORMANCE

### [P1] Image Optimization
- [ ] Lazy loading images (loading="lazy")
- [ ] Responsive srcset cho ảnh sản phẩm
- [ ] WebP format support

### [P2] Bundle Optimization
- [ ] Code splitting đã có (lazy routes) ✅
- [ ] Kiểm tra bundle size (recharts khá nặng - chỉ dùng admin)

---

## ƯU TIÊN THỰC HIỆN

### Đợt 1 - Bug fixes (Quan trọng)
1. B1: Fix Cart item link
2. B2: Thêm admin order detail route
3. B3: Fix Header admin link
4. B5: ScrollToTop component

### Đợt 2 - Layout cơ bản
5. L1: Header mobile improvements + active nav
6. L5: Card border/shadow improvements
7. D3: ProductCard hover effects
8. D6: Login/Register layout upgrade

### Đợt 3 - Design polish
9. D1: Home hero enhancement
10. D2: Category cards overlay
11. D4: Shop filter improvements
12. D7: Cart UI improvements

### Đợt 4 - UX & Admin
13. U1: Loading states consistency
14. U2: Error boundary
15. U3: Animations
16. D11: Admin dashboard enhancement
17. D12: Admin tables improvement
