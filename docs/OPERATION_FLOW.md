# 🛍️ Fashion Shop - Tổng Hợp Nghiệp Vụ & Flow Hoạt Động

Tài liệu này tổng hợp toàn bộ luồng nghiệp vụ (Business Flow) và cách thức hoạt động của hệ thống Fashion Shop, từ góc độ người dùng (User), quản trị viên (Admin), cho đến luồng xử lý kỹ thuật (Technical Flow) bên dưới hệ thống backend.

---

## 1. Tổng Quan Hệ Thống (System Overview)
Fashion Shop là một hệ thống thương mại điện tử hoàn chỉnh gồm:
- **Backend:** Java 21, Spring Boot 3.4, Spring Security, JWT, JPA/Hibernate.
- **Database:** MySQL 8.0 với 10 bảng dữ liệu chính.
- **Frontend:** React 18, Vite, Tailwind CSS, Redux Toolkit.
- **Các Module chính (12 Module):** Auth, User, Product, Category, Cart, Order, Wishlist, Review, Voucher, Payment (VNPay), Admin Dashboard, AI Recommendation, File Upload.

---

## 2. Luồng Nghiệp Vụ Dành Cho Người Dùng (User Flow)

### 2.1. Luồng Xác Thực & Tài Khoản (Authentication Flow)
1. **Đăng ký (Register):** Khách hàng nhập thông tin (Email, Password, Name). Hệ thống mã hóa mật khẩu bằng BCrypt và lưu vào DB. Một email chào mừng (Welcome Email) được gửi đi.
2. **Đăng nhập (Login/OAuth2 Google):** Khách hàng đăng nhập. Hệ thống trả về `Access Token` (JWT - 1 giờ) và `Refresh Token` (7 ngày).
3. **Quản lý tài khoản:** Khách hàng có thể cập nhật thông tin cá nhân, định chỉ chỉ giao hàng.
4. **Quên mật khẩu:** Yêu cầu reset -> Hệ thống gửi Email chứa link/token (hiệu lực 1 giờ) -> Khách hàng đặt lại mật khẩu mới.

### 2.2. Luồng Khám Phá Sản Phẩm (Shopping Experience)
1. **Duyệt danh mục & Sản phẩm:** Xem danh sách sản phẩm theo danh mục (Categories), tìm kiếm (Search), lọc (Filter), phân trang.
2. **Gợi ý thông minh (Recommendations):** Hệ thống hiển thị các sản phẩm gợi ý (Personalized), sản phẩm xu hướng (Trending), đang hot (Top-rated), hoặc tương tự (Similar).
3. **Sản phẩm yêu thích (Wishlist):** Lưu sản phẩm vào danh sách yêu thích để mua sau.

### 2.3. Luồng Giỏ Hàng (Cart Flow)
1. **Tạo giỏ hàng tự động:** Lần đầu khách hàng bấm "Thêm vào giỏ", hệ thống TỰ ĐỘNG tạo một giỏ hàng (Cart) với trạng thái `ACTIVE`.
2. **Thao tác:** 
   - Thêm sản phẩm (Hệ thống check tồn kho - Stock validation).
   - Nếu sản phẩm đã có -> Cập nhật số lượng (Tăng số lượng).
   - Nếu sản phẩm mới -> Tạo `cart_item` mới.
   - Xóa, cập nhật số lượng items trong giỏ.
3. **Tính toán:** Tổng tiền giỏ hàng (Total Amount) luôn được tính toán lại theo thời gian thực mỗi khi có thay đổi.

### 2.4. Luồng Đặt Hàng & Thanh Toán (Checkout & Order Flow)
1. **Checkout:** Khách hàng vào trang thanh toán, nhập địa chỉ (`shipping_address`), số điện thoại (`phone`).
2. **Áp dụng Voucher:** (Tùy chọn) Kiểm tra mã giảm giá (Voucher), check hạn sử dụng, số lượng, điều kiện tối thiểu. Nếu hợp lệ, tính lại tổng tiền.
3. **Tạo Đơn Hàng (Create Order):**
   - Hệ thống validate giỏ hàng (không rỗng) và check tồn kho (Stock) của từng sản phẩm.
   - Tạo mã đơn hàng độc nhất dạng `ORD-YYYYMMDD-XXXXXX`.
   - Chuyển `cart_items` thành `order_items` lưu giá mua tại thời điểm đó (`price_at_purchase`).
   - Cập nhật (TRỪ) tồn kho (`stock`) sản phẩm ngay lập tức.
   - Chuyển trạng thái giỏ hàng sang `CHECKED_OUT` (hoặc xóa/làm sạch giỏ hàng).
4. **Thanh Toán (Payment):** Khách hàng chọn phương thức:
   - **COD (Nhận hàng thanh toán):** Lên đơn thành công trạng thái `PENDING`.
   - **VNPay (Thanh toán online):** Hệ thống gọi API tạo URL VNPay. Khách hàng redirect ra VNPay thanh toán.
5. **Thông báo:** Gửi **Email xác nhận đơn hàng** kèm chi tiết đơn cho khách.

### 2.5. Luồng VNPay Payment (Technical)
1. **Tạo Request:** Backend hash dữ liệu bằng `HMAC SHA512`, trả về `vnp_PayUrl`.
2. **IPN Callback:** VNPay gọi lại API của hệ thống (backend) ẩn danh để báo trạng thái thanh toán. Backend xác thực chữ ký (Checksum), cập nhật trạng thái đơn hàng thành `PAID`.
3. **Return URL:** Trình duyệt Khách hàng được redirect về Frontend kèm tham số. Frontend gọi API Get Order để hiển thị kết quả.

### 2.6. Luồng Đánh Giá Sản Phẩm (Review Flow)
1. Sau khi nhận hàng, khách hàng có thể chấm điểm (1-5 sao) và để lại bình luận cho sản phẩm.
2. Review được lưu với trạng thái `VISIBLE`.
3. Hệ thống gửi email thông báo có tính chất ghi nhận (Review notification).
4. Điểm đánh giá trung bình của sản phẩm tự động cập nhật.

---

## 3. Luồng Nghiệp Vụ Dành Cho Quản Trị Viên (Admin Flow)

### 3.1. Quản Trị Cửa Hàng & Sản Phẩm
- **Sản phẩm, Danh mục:** Thêm mới (Tải lên hình ảnh, cấu hình URL), tùy chỉnh giảm giá (Sale price), ẩn/hiện sản phẩm.
- **Voucher:** Tạo chiến dịch khuyến mãi (Giảm theo %, giảm số tiền cố định), thiết lập hạn mức mã, giới hạn ngân sách.
- **Đánh giá (Review):** Moderation (Kiểm duyệt) – có thể ẩn (`HIDDEN`) các đánh giá vi phạm hoặc spam.

### 3.2. Xử Lý Đơn Hàng (Order Management)
- Admin theo dõi danh sách toàn bộ đơn hàng.
- **Cập nhật trạng thái thủ công:** `PENDING` -> `SHIPPING` -> `DELIVERED`.
- **Hủy đơn (Cancel):**
  - Người dùng hoặc Admin có thể hủy đơn (nếu chưa giao).
  - Khi Hủy Đơn: Hệ thống tự động **HOÀN LẠI (CỘNG LẠI) số lượng tồn kho (`stock`)** của các sản phẩm tương ứng. Gửi Email thông báo Hủy đơn.

### 3.3. Dashboard & Thống Kê (Analytics)
- Xem biểu đồ số lượng người dùng mới, tổng đơn hàng.
- Xem báo cáo doanh thu (Revenue) theo thời gian.
- Thống kê top sản phẩm bán chạy nhất, tồn kho.
- Xem Conversion Rate (Tỷ lệ chuyển đổi đơn hàng / KH).

---

## 4. Đặc Tả Kỹ Thuật (Technical Execution Flow)

- **Transaction Management:** Tất cả luồng `Create Order`, `Checkout` đều được bọc trong `@Transactional`. Nếu có bất kỳ lỗi nào (Ví dụ: hết hàng giữa chừng), toàn bộ DB sẽ tự động Rollback, đảm bảo tính vẹn toàn (ACID).
- **Security Check:** Các API phải kèm Header `Authorization: Bearer <token>`. Phân quyền Role linh hoạt qua `@PreAuthorize("ROLE_ADMIN")` hoặc `ROLE_USER`.
- **Tương Tác Database:** 10 bảng cấu trúc chéo, Hibernate ORM Lazy Loading dùng cho tối ưu hóa truy vấn (`carts` -> `cart_items`, `orders` -> `order_items`).
- **File Upload:** Upload File vật lý vào thư mục cục bộ (`/uploads/avatars`, `/uploads/products`) với rename theo format UUID + phân tích kiểm tra định dạng file an toàn. 

---

## 5. Các Trạng Thái (States) Của Thực Thể
- **Users:** `ACTIVE`, `INACTIVE`
- **Products / Categories / Vouchers:** `ACTIVE`, `INACTIVE`
- **Cart:** `ACTIVE`, `CHECKED_OUT`, `ABANDONED`
- **Orders:** `PENDING` (Chờ xử lý/Chưa thanh toán), `PAID` (Đã thanh toán), `SHIPPING` (Đang giao), `DELIVERED` (Đã giao), `CANCELLED` (Đã hủy).
- **Reviews:** `VISIBLE`, `HIDDEN`

Tài liệu này bao gồm toàn bộ Flow hoạt động của **Fashion Shop**, đảm bảo sẵn sàng để các nhà phát triển Backend và Frontend đọc, hiểu nghiệp vụ nhanh nhất và bắt đầu ghép nối API.