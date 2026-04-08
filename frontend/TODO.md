# Frontend TODO - Fashionable Shop Website

## Cấu trúc thư mục

```
frontend/src/
├── api/               # 13 API services + axiosInstance
├── components/
│   ├── common/        # EmptyState, Pagination, RouteGuards, ScrollToTop, ErrorBoundary
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
└── index.css          # Tailwind + @theme + fonts + animations
```

---

## BUG - Lỗi cần sửa ngay

### ~~[B1] Cart item link sai đường dẫn~~ ✅ ĐÃ SỬA
### ~~[B3] Header admin link path không khớp~~ ✅ ĐÃ SỬA
### ~~[B5] Không scroll to top khi chuyển trang~~ ✅ ĐÃ SỬA (ScrollToTop component)

### [B2] Admin order detail route thiếu
- **File:** `App.tsx`, `OrderManagement.tsx`
- **Vấn đề:** Admin order management link tới `/admin/orders/:id` nhưng route này không tồn tại trong App.tsx
- **Fix:** Thêm route `<Route path="orders/:id" element={<OrderDetail />} />` trong admin routes

### [B4] useEffect thiếu dependency
- **File:** `Cart.tsx`, `Checkout.tsx`, nhiều trang khác
- **Vấn đề:** `useEffect(() => { fetchCart(); }, [])` - `fetchCart` không có trong dependency array
- **Ảnh hưởng:** ESLint warning, có thể miss state update

---

## LAYOUT - Vấn đề bố cục

### ~~[L1] Header - Active nav + mobile UX~~ ✅ ĐÃ SỬA
- Nav links có active state (pill style với accent background)
- Glassmorphism header (backdrop-blur, shadow on scroll)
- Search bar có focus state rõ ràng
- User dropdown có animation

### [L2] Footer - Responsive
- [ ] Link "Hỗ trợ" section đang dùng span, nên link thực tế
- [x] Social media links đã có ✅
- [x] Gradient background cải thiện ✅

### [L3] UserLayout - Thiếu breadcrumb global
- Chỉ có ProductDetail và OrderDetail có breadcrumb riêng
- Các trang khác không có breadcrumb → user không biết mình đang ở đâu

### [L4] AdminLayout - Sidebar trên mobile
- Sidebar overlay mobile hoạt động nhưng thiếu animation slide-in
- Không có transition cho sidebar open/close
- Active menu item chỉ so sánh exact path, sub-routes không highlight parent

### ~~[L5] Card border quá nhẹ~~ ✅ ĐÃ SỬA
- ProductCard đã cải thiện border + shadow system

---

## DESIGN - Cải thiện thiết kế

### ~~[D1] Home - Hero Banner~~ ✅ ĐÃ CẢI THIỆN
- Grid 2 cột: text bên trái, visual decoration bên phải
- Decorative rings animation, floating badges
- Updated năm 2026
- Responsive: ẩn visual trên mobile

### ~~[D2] Home - Category Section~~ ✅ ĐÃ CẢI THIỆN
- Colorful gradient backgrounds khi không có ảnh (6 màu khác nhau)
- Emoji đại diện cho từng category
- Subtitle mô tả section
- Shadow on hover

### ~~[D3] ProductCard - Thiết kế tốt hơn~~ ✅ ĐÃ CẢI THIỆN
- Hover overlay với gradient bottom
- Add-to-cart overlay button (slide up on hover)
- Quick view (Eye icon) button on hover
- Wishlist heart icon overlay
- Better shadow system (0_8px_30px)
- Rounded-2xl corners

### [D4] Shop - Filter Sidebar
- **Cải thiện:**
  - [ ] Collapse/expand sections
  - [ ] Price range slider thay vì 2 input
  - [ ] Active filter summary (chips)
  - [ ] Clear all filters button
  - [ ] Brand filter
  - [ ] Rating filter

### [D5] ProductDetail - Gallery
- **Cải thiện:**
  - [ ] Zoom on hover
  - [ ] Lightbox modal khi click
  - [ ] Image carousel/slider cho mobile

### [D6] Login / Register - Thiết kế hiện đại hơn
- [x] Split layout đã có ✅
- **Cải thiện thêm:**
  - [ ] Password strength indicator cho Register
  - [ ] "Show password" toggle

### [D7] Cart - UI chi tiết hơn
- [x] Cart link fix ✅
- [x] Larger images ✅
- **Cải thiện thêm:**
  - [ ] Animation khi remove/update quantity
  - [ ] Skeleton loading cho từng item

### [D8] Orders - Timeline rõ ràng hơn
- **Cải thiện:**
  - [ ] Timeline dọc thay vì ngang (responsive hơn)
  - [ ] Icon cho từng status step

### [D9] Profile - Avatar & Tab
- **Cải thiện:**
  - [ ] Avatar preview lớn hơn với crop
  - [ ] Tab UI rõ ràng hơn (pill tabs hoặc underline style)

### ~~[D10] Vouchers - Card design~~ ✅ ĐÃ CẢI THIỆN
- Voucher card: solid card with left accent bar
- Shadow + hover shadow
- Toast xác nhận khi copy thành công

### [D11] Admin Dashboard - Charts & Stats
- **Cải thiện:**
  - [ ] Cards thêm trend indicator (mũi tên lên/xuống + %)
  - [ ] Thêm recent orders list
  - [ ] Date range picker cho filter

### [D12] Admin Tables - Chung
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

### ~~Đợt 1 - Bug fixes~~ ✅ HOÀN THÀNH
1. ~~B1: Fix Cart item link~~ ✅
2. ~~B3: Fix Header admin link~~ ✅
3. ~~B5: ScrollToTop component~~ ✅

### ~~Đợt 2 - Layout redesign~~ ✅ HOÀN THÀNH
4. ~~L1: Header glassmorphism + active nav~~ ✅
5. ~~L5: Card border/shadow improvements~~ ✅
6. ~~D3: ProductCard hover overlay effects~~ ✅
7. ~~D1: Home hero 2-column + decoration~~ ✅
8. ~~D2: Category cards colorful gradients~~ ✅
9. ~~D10: Voucher card redesign~~ ✅
10. ~~ImageWithFallback: gradient placeholders~~ ✅
11. ~~CTA Banner section added~~ ✅
12. ~~Footer gradient improvement~~ ✅
13. ~~CSS animations (fadeInUp, shimmer)~~ ✅

### Đợt 3 - Remaining bugs & features
14. B2: Thêm admin order detail route
15. B4: useEffect dependency warnings
16. L3: Global breadcrumb
17. L4: Admin sidebar animation
18. D4: Shop filter improvements
19. D5: ProductDetail gallery zoom/lightbox

### Đợt 4 - UX & Admin polish
20. U1: Loading states consistency
21. U2: Error boundary improvements
22. U3: Animations (page transitions)
23. D11: Admin dashboard enhancement
24. D12: Admin tables improvement
25. U4: Accessibility improvements
26. U5: SEO & Meta tags
