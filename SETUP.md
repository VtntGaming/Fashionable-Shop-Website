# Fashionable Shop - Hướng dẫn cài đặt & chạy project

## Tổng quan

Fashionable Shop là website thương mại điện tử thời trang gồm:
- **Backend**: Spring Boot 3.4 (Java 21) + MySQL 8.0
- **Frontend**: HTML/CSS/JavaScript thuần (SPA, hash-based routing)

---

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| Java JDK | 21+ |
| MySQL | 8.0+ |
| Maven | 3.9+ (hoặc dùng `mvnw` đi kèm) |
| Trình duyệt | Chrome/Edge/Firefox bản mới nhất |

---

## 2. Cài đặt Database

### 2.1 Tạo database

```sql
CREATE DATABASE fashion_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Hoặc để tự tạo: backend sẽ tự tạo database nếu cấu hình `createDatabaseIfNotExist=true` (mặc định).

### 2.2 Import schema (tùy chọn)

```bash
mysql -u root -p fashion_shop < schema.sql
```

---

## 3. Cấu hình Backend

### 3.1 Tạo file cấu hình môi trường

Tạo file `backend/.env.properties`:

```properties
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/fashion_shop?useSSL=false&serverTimezone=Asia/Ho_Chi_Minh&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_mysql_password

# JWT Secret (thay bằng chuỗi bí mật riêng)
JWT_SECRET=your-secret-key-base64-encoded

# Google OAuth2 (tùy chọn)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# VNPay (tùy chọn - dùng sandbox để test)
VNPAY_TMN_CODE=your-vnpay-tmn-code
VNPAY_HASH_SECRET=your-vnpay-hash-secret

# Email (tùy chọn - dùng cho quên mật khẩu)
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

### 3.2 Các biến môi trường

| Biến | Mô tả | Mặc định |
|------|--------|----------|
| `SERVER_PORT` | Cổng backend | `8080` |
| `SPRING_DATASOURCE_URL` | JDBC URL MySQL | `localhost:3306/fashion_shop` |
| `SPRING_DATASOURCE_USERNAME` | MySQL username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL password | _(trống)_ |
| `JWT_SECRET` | Khóa bí mật JWT (Base64) | dev key |
| `JWT_EXPIRATION` | Thời gian sống access token (ms) | `3600000` (1 giờ) |
| `JWT_REFRESH_EXPIRATION` | Thời gian sống refresh token (ms) | `604800000` (7 ngày) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID | _(trống)_ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret | _(trống)_ |
| `VNPAY_TMN_CODE` | Mã terminal VNPay | _(trống)_ |
| `VNPAY_HASH_SECRET` | Hash secret VNPay | _(trống)_ |

---

## 4. Chạy Backend

### Cách 1: Dùng Maven Wrapper

```bash
cd backend
./mvnw spring-boot:run
```

Windows:
```cmd
cd backend
mvnw.cmd spring-boot:run
```

### Cách 2: Dùng script có sẵn

```bash
cd backend
./run-server.sh   # Linux/Mac
run-server.bat    # Windows
```

### Cách 3: Build JAR rồi chạy

```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/fashion-shop-0.0.1-SNAPSHOT.jar
```

Backend sẽ chạy tại: **http://localhost:8080**

---

## 5. Chạy Frontend

Frontend là static HTML/CSS/JS, không cần build. Có nhiều cách serve:

### Cách 1: Dùng backend serve (khuyến nghị cho dev)

Backend Spring Boot tự serve static files. Copy thư mục `frontend/` vào `backend/src/main/resources/static/` hoặc cấu hình proxy.

### Cách 2: Dùng Live Server (VS Code)

1. Cài extension **Live Server** trong VS Code
2. Mở file `frontend/index.html`
3. Click **"Go Live"** ở thanh status bar
4. Mở trình duyệt tại **http://localhost:5500**

### Cách 3: Dùng Python HTTP server

```bash
cd frontend
python -m http.server 3000
```

### Cách 4: Dùng Node.js HTTP server

```bash
npx serve frontend -l 3000
```

Frontend sẽ chạy tại: **http://localhost:3000** (hoặc port bạn chọn)

### Cấu hình API URL

Mở file `frontend/js/config.js` và chỉnh `API_BASE_URL`:

```javascript
const Config = {
  API_BASE_URL: 'http://localhost:8080/api',  // URL backend API
  // ...
};
```

> **Lưu ý CORS**: Backend cần cho phép origin của frontend. Nếu dùng Live Server (port 5500) hoặc port 3000, đảm bảo backend đã cấu hình CORS cho origin đó.

---

## 6. Tài khoản mặc định

Sau khi chạy lần đầu, tạo tài khoản qua API hoặc trang đăng ký:
- Đăng ký tại: `http://localhost:3000/#/register`
- Để set Admin, cập nhật trực tiếp trong database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

---

## 7. Cấu trúc thư mục

```
├── backend/                # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   ├── src/main/resources/ # Config files
│   ├── pom.xml             # Maven dependencies
│   └── uploads/            # Uploaded files (avatars, products)
├── frontend/               # Static HTML/CSS/JS frontend
│   ├── index.html          # SPA entry point
│   ├── css/                # Stylesheets
│   │   ├── style.css       # Base styles, variables, utilities
│   │   ├── components.css  # Component styles
│   │   ├── pages.css       # Page-specific styles
│   │   └── admin.css       # Admin panel styles
│   └── js/                 # JavaScript
│       ├── config.js       # Configuration
│       ├── utils.js        # Utility functions
│       ├── api.js          # API client layer
│       ├── store.js        # State management
│       ├── auth.js         # Authentication
│       ├── router.js       # SPA hash router
│       ├── app.js          # App bootstrap
│       ├── components/     # Reusable UI components
│       └── pages/          # Page modules
│           └── admin/      # Admin page modules
├── docs/                   # Documentation
├── schema.sql              # Database schema
└── .github/workflows/      # CI/CD
```

---

## 8. Tính năng

### Người dùng
- Đăng ký / Đăng nhập (Email + Google OAuth2)
- Duyệt sản phẩm, tìm kiếm, lọc theo danh mục & giá
- Giỏ hàng, checkout, thanh toán (COD / VNPay)
- Quản lý đơn hàng, hủy đơn
- Danh sách yêu thích (wishlist)
- Đánh giá sản phẩm
- Mã giảm giá (voucher)
- Quản lý hồ sơ, đổi mật khẩu, avatar

### Admin
- Dashboard thống kê
- Quản lý sản phẩm (CRUD + upload ảnh)
- Quản lý danh mục
- Quản lý đơn hàng (cập nhật trạng thái)
- Quản lý khách hàng (đổi vai trò)
- Quản lý mã giảm giá
- Quản lý đánh giá

---

## 9. Triển khai (Deployment)

### Frontend → GitHub Pages

Frontend tự động deploy qua GitHub Actions khi push lên branch `main`/`master`.
File `.github/workflows/frontend-pages.yml` đã được cấu hình sẵn.

### Backend → Server/VPS

```bash
cd backend
./mvnw clean package -DskipTests
scp target/fashion-shop-0.0.1-SNAPSHOT.jar user@server:/app/
ssh user@server "java -jar /app/fashion-shop-0.0.1-SNAPSHOT.jar"
```

---

## 10. Testing

### Backend tests
```bash
cd backend
./mvnw test
```

### API testing
Import file `Fashion_Shop_API.postman_collection.json` vào Postman.

---

## Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| CORS error | Kiểm tra cấu hình CORS cho origin frontend trong backend |
| Lỗi kết nối database | Kiểm tra MySQL đang chạy, username/password đúng |
| Ảnh không hiển thị | Kiểm tra thư mục `uploads/` tồn tại và có quyền ghi |
| VNPay không hoạt động | Kiểm tra `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET` |
| Google OAuth lỗi | Kiểm tra Client ID/Secret và Redirect URI trong Google Console |
