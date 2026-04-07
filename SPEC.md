# Fashion Shop - Đặc tả Chi tiết Dự án

## 1. Tổng quan

- **Tên dự án**: Fashion Shop - Trang web bán quần áo thời trang online
- **Mô tả**: Website thương mại điện tử đầy đủ tính năng với Spring Boot Backend + React Frontend + MySQL, tích hợp thanh toán VNPay
- **Nhóm đối tượng**: Khách hàng mua sắm online, quản trị viên

---

## 2. Công nghệ Stack

| Layer      | Công nghệ                                                      |
|------------|----------------------------------------------------------------|
| Backend    | Java 21, Spring Boot 3.4, Spring Security, JWT, JPA/Hibernate |
| Frontend   | React 18, Vite, Tailwind CSS, Axios, React Router, Redux Toolkit |
| Database   | MySQL 8.0                                                      |
| Payment    | VNPay (sandbox)                                                |
| Container  | Docker + Docker Compose                                        |
| Server     | Ubuntu VPS + Nginx + SSL                                       |

---

## 3. Database Schema - 10 Bảng MySQL

### 3.1 `users`
| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | BIGINT       | PK, AUTO_INCREMENT             |
| email       | VARCHAR(255) | UNIQUE, NOT NULL               |
| password    | VARCHAR(255) | NOT NULL (BCrypt)              |
| full_name   | VARCHAR(255) | NOT NULL                       |
| phone       | VARCHAR(20)  |                                |
| address     | TEXT         |                                |
| role        | ENUM         | 'USER', 'ADMIN', default 'USER'|
| status      | ENUM         | 'ACTIVE', 'INACTIVE', default 'ACTIVE' |
| google_id   | VARCHAR(255) | UNIQUE, nullable               |
| reset_token | VARCHAR(255) | nullable                       |
| created_at  | TIMESTAMP    | default CURRENT_TIMESTAMP      |
| updated_at  | TIMESTAMP    | on update CURRENT_TIMESTAMP    |

### 3.2 `categories`
| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | BIGINT       | PK, AUTO_INCREMENT             |
| name        | VARCHAR(255) | NOT NULL                       |
| slug        | VARCHAR(255) | UNIQUE, NOT NULL               |
| description | TEXT         |                                |
| image_url   | VARCHAR(500) |                                |
| parent_id   | BIGINT       | FK -> categories.id, nullable  |
| status      | ENUM         | 'ACTIVE', 'INACTIVE', default 'ACTIVE' |
| created_at  | TIMESTAMP    | default CURRENT_TIMESTAMP      |

### 3.3 `products`
| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | BIGINT       | PK, AUTO_INCREMENT             |
| name        | VARCHAR(255) | NOT NULL                       |
| slug        | VARCHAR(255) | UNIQUE, NOT NULL               |
| description | TEXT         |                                |
| price       | DECIMAL(10,2)| NOT NULL                       |
| sale_price  | DECIMAL(10,2)| nullable                       |
| stock       | INT          | default 0                      |
| category_id | BIGINT       | FK -> categories.id            |
| brand       | VARCHAR(255) |                                |
| image_url   | VARCHAR(500) |                                |
| views       | INT          | default 0                      |
| status      | ENUM         | 'ACTIVE', 'INACTIVE', default 'ACTIVE' |
| created_at  | TIMESTAMP    | default CURRENT_TIMESTAMP      |

### 3.4 `product_images`
| Column      | Type         | Constraints                    |
|-------------|--------------|--------------------------------|
| id          | BIGINT       | PK, AUTO_INCREMENT             |
| product_id  | BIGINT       | FK -> products.id              |
| image_url   | VARCHAR(500) | NOT NULL                       |
| is_primary  | BOOLEAN      | default false                  |

### 3.5 `orders`
| Column            | Type         | Constraints                    |
|-------------------|--------------|--------------------------------|
| id                | BIGINT       | PK, AUTO_INCREMENT             |
| user_id           | BIGINT       | FK -> users.id                 |
| order_code        | VARCHAR(50)  | UNIQUE, NOT NULL               |
| total_amount      | DECIMAL(10,2)| NOT NULL                       |
| status            | ENUM         | 'PENDING','PAID','SHIPPING','DELIVERED','CANCELLED' |
| shipping_address  | TEXT         | NOT NULL                       |
| phone             | VARCHAR(20)  | NOT NULL                       |
| payment_method    | ENUM         | 'COD', 'VNPAY', default 'COD'  |
| voucher_id        | BIGINT       | FK -> vouchers.id, nullable    |
| vnp_txn_ref       | VARCHAR(100) | nullable                       |
| created_at        | TIMESTAMP    | default CURRENT_TIMESTAMP      |

### 3.6 `order_items`
| Column           | Type         | Constraints                    |
|------------------|--------------|--------------------------------|
| id               | BIGINT       | PK, AUTO_INCREMENT             |
| order_id         | BIGINT       | FK -> orders.id                |
| product_id       | BIGINT       | FK -> products.id              |
| quantity         | INT          | NOT NULL                       |
| price_at_purchase| DECIMAL(10,2)| NOT NULL                       |

### 3.7 `wishlists`
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | BIGINT       | PK, AUTO_INCREMENT             |
| user_id    | BIGINT       | FK -> users.id                 |
| product_id | BIGINT       | FK -> products.id              |
| created_at | TIMESTAMP    | default CURRENT_TIMESTAMP      |

### 3.8 `reviews`
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | BIGINT       | PK, AUTO_INCREMENT             |
| user_id    | BIGINT       | FK -> users.id                 |
| product_id | BIGINT       | FK -> products.id              |
| rating     | INT          | NOT NULL (1-5)                |
| comment    | TEXT         |                                |
| status     | ENUM         | 'VISIBLE', 'HIDDEN', default 'VISIBLE' |
| created_at | TIMESTAMP    | default CURRENT_TIMESTAMP      |

### 3.9 `vouchers`
| Column          | Type         | Constraints                    |
|-----------------|--------------|--------------------------------|
| id              | BIGINT       | PK, AUTO_INCREMENT             |
| code            | VARCHAR(50)  | UNIQUE, NOT NULL               |
| discount_type   | ENUM         | 'PERCENT', 'AMOUNT'            |
| discount_value  | DECIMAL(10,2)| NOT NULL                       |
| min_order_value | DECIMAL(10,2)| default 0                      |
| max_discount    | DECIMAL(10,2)| nullable                       |
| quantity        | INT          | default 0                      |
| start_date      | TIMESTAMP    | NOT NULL                      |
| end_date        | TIMESTAMP    | NOT NULL                      |
| status          | ENUM         | 'ACTIVE', 'INACTIVE', default 'ACTIVE' |

### 3.10 `cart_items`
| Column     | Type         | Constraints                    |
|------------|--------------|--------------------------------|
| id         | BIGINT       | PK, AUTO_INCREMENT             |
| user_id    | BIGINT       | FK -> users.id                 |
| product_id | BIGINT       | FK -> products.id              |
| quantity   | INT          | default 1                     |
| created_at | TIMESTAMP    | default CURRENT_TIMESTAMP      |

---

## 4. Backend API Endpoints

### 4.1 Auth Module (`/api/auth`)
- `POST /register` - Đăng ký tài khoản mới
- `POST /login` - Đăng nhập (trả về JWT access + refresh token)
- `POST /refresh` - Làm mới access token
- `POST /forgot-password` - Gửi email đặt lại mật khẩu
- `POST /reset-password` - Đặt lại mật khẩu mới
- `POST /oauth2/google` - Đăng nhập Google OAuth2

### 4.2 User Module (`/api/users`)
- `GET /api/users/{id}` - Lấy thông tin user
- `PUT /api/users/{id}` - Cập nhật thông tin user
- `PUT /api/users/{id}/status` - Bật/tắt tài khoản (Admin)
- `GET /api/users` - Danh sách users (Admin)

### 4.3 Category Module (`/api/categories`)
- `GET /api/categories` - Danh sách categories
- `GET /api/categories/{id}` - Chi tiết category
- `POST /api/categories` - Tạo category (Admin)
- `PUT /api/categories/{id}` - Cập nhật category (Admin)
- `DELETE /api/categories/{id}` - Xóa category (Admin)

### 4.4 Product Module (`/api/products`)
- `GET /api/products` - Danh sách sản phẩm (phân trang, filter, sort)
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin)
- `PUT /api/products/{id}` - Cập nhật sản phẩm (Admin)
- `DELETE /api/products/{id}` - Xóa sản phẩm (Admin)
- `GET /api/products/search` - Tìm kiếm sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật

### 4.5 Cart Module (`/api/cart`)
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart` - Thêm vào giỏ hàng
- `PUT /api/cart/{id}` - Cập nhật số lượng
- `DELETE /api/cart/{id}` - Xóa sản phẩm khỏi giỏ
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng

### 4.6 Order Module (`/api/orders`)
- `GET /api/orders` - Danh sách đơn hàng của user
- `GET /api/orders/{id}` - Chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `PUT /api/orders/{id}/status` - Cập nhật trạng thái (Admin)
- `GET /api/orders/all` - Tất cả đơn hàng (Admin)

### 4.7 Wishlist Module (`/api/wishlist`)
- `GET /api/wishlist` - Lấy wishlist
- `POST /api/wishlist` - Thêm vào wishlist
- `DELETE /api/wishlist/{productId}` - Xóa khỏi wishlist

### 4.8 Review Module (`/api/reviews`)
- `POST /api/reviews` - Tạo review
- `GET /api/reviews/product/{productId}` - Reviews theo sản phẩm
- `PUT /api/reviews/{id}` - Cập nhật review (chủ sở hữu)
- `DELETE /api/reviews/{id}` - Xóa review (chủ sở hữu)
- `PUT /api/reviews/{id}/status` - Bật/tắt review (Admin)

### 4.9 Voucher Module (`/api/vouchers`)
- `GET /api/vouchers` - Danh sách voucher (public)
- `GET /api/vouchers/{code}` - Kiểm tra voucher
- `POST /api/vouchers` - Tạo voucher (Admin)
- `PUT /api/vouchers/{id}` - Cập nhật voucher (Admin)
- `DELETE /api/vouchers/{id}` - Xóa voucher (Admin)

### 4.10 Payment Module (`/api/payment`)
- `POST /api/payment/vnpay/create` - Tạo URL thanh toán VNPay
- `GET /api/payment/vnpay/return` - VNPay return URL
- `POST /api/payment/vnpay/ipn` - VNPay IPN callback

### 4.11 Admin/Stats Module (`/api/admin`)
- `GET /api/admin/dashboard` - Thống kê dashboard
- `GET /api/admin/reports/revenue` - Báo cáo doanh thu
- `GET /api/admin/reports/products` - Top sản phẩm
- `POST /api/admin/reports/export` - Xuất PDF/Excel

### 4.12 AI Recommendation (`/api/recommendations`)
- `GET /api/recommendations` - Gợi ý sản phẩm cho user

---

## 5. Frontend Pages

### 5.1 User Pages
| Route           | Mô tả                              |
|----------------|-----------------------------------|
| `/`            | Trang chủ                          |
| `/shop`        | Danh sách sản phẩm                 |
| `/product/:slug`| Chi tiết sản phẩm                 |
| `/login`       | Đăng nhập                          |
| `/register`    | Đăng ký                            |
| `/forgot-password` | Quên mật khẩu                  |
| `/cart`        | Giỏ hàng                           |
| `/checkout`    | Thanh toán                         |
| `/orders`      | Danh sách đơn hàng                 |
| `/orders/:id`  | Chi tiết đơn hàng                 |
| `/wishlist`    | Sản phẩm yêu thích                 |
| `/profile`     | Thông tin cá nhân                  |
| `/vouchers`    | Danh sách voucher                   |

### 5.2 Admin Pages
| Route              | Mô tả                       |
|-------------------|----------------------------|
| `/admin/dashboard`| Dashboard thống kê         |
| `/admin/products` | Quản lý sản phẩm           |
| `/admin/categories`| Quản lý danh mục           |
| `/admin/orders`   | Quản lý đơn hàng           |
| `/admin/customers`| Quản lý khách hàng         |
| `/admin/vouchers` | Quản lý voucher            |
| `/admin/reviews` | Duyệt reviews              |
| `/admin/reports`  | Báo cáo doanh thu          |

---

## 6. Bảo mật

- **JWT**: Access token 1 giờ, Refresh token 7 ngày
- **Password**: BCrypt 12 rounds
- **OAuth2**: Google Login
- **CORS**: Chỉ cho phép frontend domain
- **Rate Limiting**: Giới hạn request/phút
- **Phân quyền**: `@PreAuthorize("ROLE_ADMIN")` cho admin endpoints
- **SQL Injection**: Dùng JPA parameterized queries
- **XSS**: Sanitize input, CSP headers
- **HTTPS**: Bắt buộc trên production

---

## 7. Docker Deployment

- **Backend**: Java 21 + Spring Boot JAR (port 8080)
- **Frontend**: Node 20 + React build + Nginx (port 80)
- **MySQL**: Docker container (port 3306)
- **Nginx**: Reverse proxy (port 80/443)

---

## 8. Điểm số dự kiến

- Nhóm cơ bản: 5/10 điểm
- Deploy: 2/10 điểm
- Tính năng nâng cao: 0.5/10 điểm
- **Tổng: 7.5/10 điểm**
