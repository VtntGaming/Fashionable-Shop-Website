# 🚀 HƯỚNG DẪN CHẠY SERVER & TEST API BẰNG POSTMAN

## 1️⃣ CHẠY SERVER

### Cách 1: Chạy JAR File (Production)
```bash
cd d:\Fashionable-Shop-Website\fashion-shop
java -jar target/fashion-shop-0.0.1-SNAPSHOT.jar
```

### Cách 2: Chạy với Maven (Development)
```bash
cd d:\Fashionable-Shop-Website\fashion-shop
mvn spring-boot:run
```

### ✅ Server Sẵn Sàng Khi Bạn Thấy:
```
Tomcat started on port 8080 (http) with context path '/'
Started FashionShopApplication in X seconds
```

### Base URL: `http://localhost:8080`

---

## 2️⃣ SETUP POSTMAN

### Tạo Postman Collection
1. **Mở Postman** → **Create** → **Collection** → Đặt tên `Fashion Shop API`
2. **Tab Settings** → Thêm **Environment Variable**:
   ```
   base_url = http://localhost:8080
   token = (sẽ được cập nhật sau khi login)
   ```

### Các Headers Cần Thiết
```
Content-Type: application/json
Authorization: Bearer {token}  (chỉ khi authenticate)
```

---

## 3️⃣ FLOW TESTING (Theo Thứ Tự)

### **A. AUTHENTICATION (Đăng ký & Đăng nhập)**

#### 1. Register (Đăng ký người dùng mới)
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "email": "user1@example.com",
  "password": "Password@123",
  "fullName": "John Doe",
  "phone": "0901234567"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600000
  }
}
```
**👉 Copy `accessToken` → Settings → `token` variable**

#### 2. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "user1@example.com",
  "password": "Password@123"
}
```

#### 3. Refresh Token
```
POST http://localhost:8080/api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

---

### **B. CATEGORY MODULE (Danh mục sản phẩm)**

#### 1. Tạo Category (Admin)
```
POST http://localhost:8080/api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Men's Fashion",
  "slug": "mens-fashion",
  "description": "All men clothing"
}
```

#### 2. Lấy Danh Sách Categories
```
GET http://localhost:8080/api/categories
```

#### 3. Lấy Category Chi Tiết
```
GET http://localhost:8080/api/categories/1
```

#### 4. Cập nhật Category (Admin)
```
PUT http://localhost:8080/api/categories/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Men's Fashion Updated",
  "description": "Updated description"
}
```

#### 5. Xóa Category (Admin)
```
DELETE http://localhost:8080/api/categories/1
Authorization: Bearer {token}
```

---

### **C. PRODUCT MODULE (Sản phẩm)**

#### 1. Tạo Product (Admin)
```
POST http://localhost:8080/api/products
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Casual T-Shirt",
  "slug": "casual-t-shirt",
  "description": "Comfortable cotton t-shirt",
  "price": 250000,
  "salePrice": 199000,
  "stock": 50,
  "categoryId": 1,
  "brand": "Nike",
  "imageUrl": "https://example.com/shirt.jpg",
  "additionalImages": [
    "https://example.com/shirt2.jpg"
  ]
}
```

#### 2. Lấy Danh Sách Products (Có Filter)
```
GET http://localhost:8080/api/products?page=0&size=12&sortBy=createdAt&sortDir=desc

Optional Params:
  ?categoryId=1
  ?keyword=shirt
  ?minPrice=100000&maxPrice=500000
```

#### 3. Lấy Product Chi Tiết
```
GET http://localhost:8080/api/products/1
```

#### 4. Tìm Product Theo Slug
```
GET http://localhost:8080/api/products/slug/casual-t-shirt
```

#### 5. Search Products
```
GET http://localhost:8080/api/products/search?q=shirt&page=0&size=12
```

#### 6. Get Featured Products
```
GET http://localhost:8080/api/products/featured?page=0&size=8
```

#### 7. Cập nhật Product (Admin)
```
PUT http://localhost:8080/api/products/1
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "name": "Casual T-Shirt Updated",
  "price": 280000,
  "stock": 45
}
```

#### 8. Xóa Product (Admin)
```
DELETE http://localhost:8080/api/products/1
Authorization: Bearer {admin-token}
```

---

### **D. CART MODULE (Giỏ hàng)**

#### 1. Thêm Vào Giỏ
```
POST http://localhost:8080/api/carts/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

#### 2. Xem Giỏ Hàng
```
GET http://localhost:8080/api/carts
Authorization: Bearer {token}
```

#### 3. Cập nhật Số Lượng
```
PUT http://localhost:8080/api/carts/items/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

#### 4. Xóa Khỏi Giỏ
```
DELETE http://localhost:8080/api/carts/items/1
Authorization: Bearer {token}
```

#### 5. Xóa Toàn Bộ Giỏ
```
DELETE http://localhost:8080/api/carts
Authorization: Bearer {token}
```

---

### **E. ORDER MODULE (Đơn hàng)**

#### 1. Tạo Đơn Hàng
```
POST http://localhost:8080/api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "paymentMethod": "COD",
  "shippingAddress": "123 Main St, City, Country",
  "notes": "Please deliver carefully"
}
```

#### 2. Xem Đơn Hàng Của User
```
GET http://localhost:8080/api/orders?page=0&size=10
Authorization: Bearer {token}
```

#### 3. Xem Chi Tiết Đơn Hàng
```
GET http://localhost:8080/api/orders/1
Authorization: Bearer {token}
```

#### 4. Xem Đơn Hàng Theo Order Code
```
GET http://localhost:8080/api/orders/code/ORD-20260407-123456
Authorization: Bearer {token}
```

#### 5. Cập nhật Trạng Thái Đơn Hàng (Admin)
```
PUT http://localhost:8080/api/orders/1/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "SHIPPING"
}
```

#### 6. Hủy Đơn Hàng
```
DELETE http://localhost:8080/api/orders/1
Authorization: Bearer {token}
```

---

### **F. WISHLIST MODULE (Yêu thích)**

#### 1. Thêm Vào Wishlist
```
POST http://localhost:8080/api/wishlists
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1
}
```

#### 2. Xem Wishlist
```
GET http://localhost:8080/api/wishlists
Authorization: Bearer {token}
```

#### 3. Kiểm Tra Sản Phẩm Có Trong Wishlist
```
GET http://localhost:8080/api/wishlists/check/1
Authorization: Bearer {token}
```

#### 4. Xoá Khỏi Wishlist
```
DELETE http://localhost:8080/api/wishlists/1
Authorization: Bearer {token}
```

---

### **G. REVIEW MODULE (Đánh giá)**

#### 1. Tạo Review
```
POST http://localhost:8080/api/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "rating": 5,
  "comment": "Great product! Highly recommended."
}
```

#### 2. Lấy Reviews Của Sản Phẩm
```
GET http://localhost:8080/api/reviews/products/1?page=0&size=10
```

#### 3. Lấy Reviews Của User
```
GET http://localhost:8080/api/reviews/users/1?page=0&size=10
Authorization: Bearer {token}
```

#### 4. Lấy Chi Tiết Review
```
GET http://localhost:8080/api/reviews/1
```

#### 5. Cập nhật Review
```
PUT http://localhost:8080/api/reviews/1
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Good product, but delivery was slow"
}
```

#### 6. Xóa Review
```
DELETE http://localhost:8080/api/reviews/1
Authorization: Bearer {token}
```

#### 7. Admin Cập nhật Trạng Thái Review
```
PUT http://localhost:8080/api/reviews/1/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "HIDDEN"
}
```

---

### **H. VOUCHER MODULE (Mã giảm giá)**

#### 1. Tạo Voucher (Admin)
```
POST http://localhost:8080/api/vouchers
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "code": "SAVE10",
  "discountType": "PERCENT",
  "discountValue": 10,
  "maxDiscount": 100000,
  "minOrderAmount": 300000,
  "expiryDate": "2026-12-31T23:59:59",
  "quantity": 100,
  "description": "10% off for orders above 300k"
}
```

#### 2. Lấy Danh Sách Vouchers
```
GET http://localhost:8080/api/vouchers?page=0&size=10
```

#### 3. Lấy Chi Tiết Voucher
```
GET http://localhost:8080/api/vouchers/1
```

#### 4. Kiểm Tra & Tính Discount
```
POST http://localhost:8080/api/vouchers/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SAVE10",
  "orderAmount": 500000
}
```

#### 5. Cập nhật Voucher (Admin)
```
PUT http://localhost:8080/api/vouchers/1
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "discountValue": 15,
  "quantity": 80
}
```

#### 6. Xóa Voucher (Admin)
```
DELETE http://localhost:8080/api/vouchers/1
Authorization: Bearer {admin-token}
```

---

### **I. PAYMENT MODULE (Thanh toán VNPay)**

#### 1. Tạo Payment URL (Lấy Link Thanh Toán VNPay)
```
POST http://localhost:8080/api/payment/vnpay/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": 1,
  "amount": 500000,
  "orderInfo": "Payment for order #ORD-20260407-123456",
  "returnUrl": "http://localhost:3000/payment-result"
}
```

#### 2. Xem Lịch Sử Thanh Toán
```
GET http://localhost:8080/api/payment/payments?page=0&size=10
Authorization: Bearer {token}
```

#### 3. Xem Chi Tiết Thanh Toán
```
GET http://localhost:8080/api/payment/payments/1
Authorization: Bearer {token}
```

---

### **J. ADMIN STATS MODULE (Thống kê)**

#### 1. Dashboard (Admin)
```
GET http://localhost:8080/api/admin/stats/dashboard
Authorization: Bearer {admin-token}
```

#### 2. Revenue Report (Admin)
```
GET http://localhost:8080/api/admin/stats/revenue
Authorization: Bearer {admin-token}
```

#### 3. Product Stats (Admin)
```
GET http://localhost:8080/api/admin/stats/products
Authorization: Bearer {admin-token}
```

#### 4. User Stats (Admin)
```
GET http://localhost:8080/api/admin/stats/users
Authorization: Bearer {admin-token}
```

#### 5. Order Stats (Admin)
```
GET http://localhost:8080/api/admin/stats/orders
Authorization: Bearer {admin-token}
```

---

### **K. USER PROFILE MODULE (Hồ sơ người dùng)**

#### 1. Xem Profile Của Tôi
```
GET http://localhost:8080/api/users/profile
Authorization: Bearer {token}
```

#### 2. Cập nhật Profile
```
PUT http://localhost:8080/api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "fullName": "John Doe Updated",
  "phone": "0987654321",
  "address": "456 New Street, City, Country"
}
```

#### 3. Xem Profile User Khác (Admin)
```
GET http://localhost:8080/api/users/1
Authorization: Bearer {admin-token}
```

#### 4. Lấy Danh Sách Users (Admin)
```
GET http://localhost:8080/api/users?page=0&size=20
Authorization: Bearer {admin-token}
```

#### 5. Cập nhật Trạng Thái User (Admin)
```
PUT http://localhost:8080/api/users/1/status
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

#### 6. Xóa User (Admin)
```
DELETE http://localhost:8080/api/users/1
Authorization: Bearer {admin-token}
```

---

### **L. RECOMMENDATION MODULE (Gợi ý sản phẩm)**

#### 1. Gợi Ý Cá Nhân (Authenticated)
```
GET http://localhost:8080/api/recommendations/personalized?limit=8
Authorization: Bearer {token}
```

#### 2. Gợi Ý Cho Khách (No Auth)
```
GET http://localhost:8080/api/recommendations/guest?limit=8
```

#### 3. Sản Phẩm Tương Tự
```
GET http://localhost:8080/api/recommendations/similar/1?limit=6
```

#### 4. Trending Products
```
GET http://localhost:8080/api/recommendations/trending?limit=8
```

---

### **M. FILE UPLOAD MODULE (Upload Ảnh)**

#### 1. Upload Ảnh Sản Phẩm (Admin)
```
POST http://localhost:8080/api/files/products/images
Authorization: Bearer {admin-token}

Form-data:
  Key: file
  Value: {upload image file}
```

#### 2. Upload Batch Ảnh (Admin)
```
POST http://localhost:8080/api/files/products/images/batch
Authorization: Bearer {admin-token}

Form-data:
  Key: files
  Value: {multiple image files}
```

#### 3. Upload Avatar
```
POST http://localhost:8080/api/files/avatars
Authorization: Bearer {token}

Form-data:
  Key: file
  Value: {upload image file}
```

#### 4. Xóa File (Admin)
```
DELETE http://localhost:8080/api/files?fileUrl=/uploads/products/xxx.jpg
Authorization: Bearer {admin-token}
```

---

## 4️⃣ POSTMAN IMPORT/EXPORT

### Export Collection Để Share
Postman → Collection → Menu "..." → **Export** → Lưu JSON file

### Import Collection
Postman → **Import** → Chọn JSON file → Done!

---

## 5️⃣ POSTMAN TEST TIPS

### Sử dụng Environment Variable
```
{{base_url}}/api/products     → http://localhost:8080/api/products
{{token}}                      → Bearer eyJhbGciOiJIUzUxMiJ9...
```

### Test Script (Tự động Save Token)
Trong Postman, tab **Tests**, add:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.accessToken) {
        pm.environment.set("token", jsonData.data.accessToken);
    }
}
```

### Header Authorization
```
Key: Authorization
Value: Bearer {{token}}
```

---

## 6️⃣ TEST SCENARIOS

### Scenario 1: Complete Purchase Flow
1. ✅ Register → Get Token
2. ✅ Browse Products
3. ✅ Add to Cart
4. ✅ Create Order
5. ✅ View Order Details
6. ✅ Create Review
7. ✅ View Dashboard (Admin)

### Scenario 2: Admin Management
1. ✅ Login as Admin
2. ✅ Create Category
3. ✅ Create Product
4. ✅ Create Voucher
5. ✅ View Statistics
6. ✅ Update User Status

### Scenario 3: Payment Testing
1. ✅ Create Order
2. ✅ Generate VNPay URL
3. ✅ Process Payment (Sandbox)
4. ✅ Verify Payment Status

---

## 7️⃣ COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Missing/Invalid token | Login again, copy new token |
| `403 Forbidden` | Not admin | Use admin token |
| `404 Not Found` | Wrong ID/Endpoint | Check endpoint URL |
| `400 Bad Request` | Invalid data | Validate JSON format |
| `500 Internal Error` | Server error | Check server logs |

---

## ✅ TESTING CHECKLIST

- [ ] Register & Login
- [ ] Browse Products
- [ ] Filter Products  
- [ ] Add to Cart
- [ ] Create Order
- [ ] View Orders
- [ ] Create Review
- [ ] Add Wishlist
- [ ] Apply Voucher
- [ ] Generate Payment URL
- [ ] View Admin Stats
- [ ] Upload Files
- [ ] Get Recommendations

---

**Happy Testing! 🎉**
