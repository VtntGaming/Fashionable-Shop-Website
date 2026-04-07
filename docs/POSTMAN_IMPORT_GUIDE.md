# 📮 Postman Collection Import Guide

## Step 1: Import Collection vào Postman

### Cách 1: Import từ File (Recommended)
1. **Mở Postman** - Launch ứng dụng Postman
2. **Click "Import"** - Nút bên phía trái hoặc Menu → File → Import
3. **Chọn File** - Tìm và chọn file `Fashion_Shop_API.postman_collection.json`
4. **Import** - Click Import button

### Cách 2: Copy Collection JSON
1. Mở file `Fashion_Shop_API.postman_collection.json`
2. Copy toàn bộ nội dung
3. Postman → Import → Paste Raw Text
4. Import

---

## Step 2: Setup Environment Variables

Sau khi import collection, bạn cần setup biến môi trường:

### 2.1 Tạo Environment
1. Click **"Environment"** (ngoài cùng bên phải)
2. Click **"Create Environment"**
3. Đặt tên: `Fashion Shop Local`
4. Thêm 2 biến:

| Variable | Value | Type |
|----------|-------|------|
| `base_url` | `http://localhost:8080` | string |
| `token` | (để trống, sẽ tự động lấp đầy sau khi login) | string |

5. Click **Save**

### 2.2 Chọn Environment Vừa Tạo
- Góc phải trên, dropdown environment → Chọn **"Fashion Shop Local"**

---

## Step 3: Chạy API Tests Theo Thứ Tự

### 🔐 **Bước 1: Đăng Ký (Register)**
1. Chọn Request: **Authentication → Register**
2. Sửa email nếu muốn: `"email": "your_email@example.com"`
3. Click **Send**
4. Nếu thành công → Status 200 ✅

**Response mẫu:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "fullName": "John Doe"
  }
}
```

### 🔓 **Bước 2: Đăng Nhập (Login)**
1. Chọn Request: **Authentication → Login**
2. Thanh Gửi (Send)
3. **Sao chép token từ Response:**
   - Copy giá trị `accessToken` từ response
   - Chuột phải → Set as variable → `{{token}}`
   - Hoặc bán thủ công: Environment → {{token}} → Paste

**Response mẫu:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "user": {
    "id": 1,
    "email": "user1@example.com"
  }
}
```

---

## Step 4: Test Các API Module

### 📦 **Products Module**
✅ **GET All Products**
- Request: `Products → Get All Products`
- Không cần token
- Kết quả: Danh sách 12 sản phẩm đầu tiên

✅ **Search Products**
- Request: `Products → Search Products`
- Keyword: "shirt"
- Kết quả: Các sản phẩm có chứa "shirt"

✅ **Create Product (Admin only)**
- Request: `Products → Create Product`
- Cần token (đã setup ở bước 2)
- Role: ADMIN
- Status: 201 Created ✅

### 🛒 **Cart Module**
✅ **View Cart**
- Request: `Cart → View Cart`
- Cần token
- Xem các mục trong giỏ hàng

✅ **Add to Cart**
- Request: `Cart → Add to Cart`
- `productId: 1, quantity: 2`
- Cần có product với ID 1

✅ **Remove from Cart**
- Request: `Cart → Remove from Cart`
- Xóa sản phẩm từ giỏ

### 📋 **Orders Module**
✅ **Create Order**
- Request: `Orders → Create Order`
- Yêu cầu: Cart không rỗng
- Kết quả: Order được tạo với code ORD-YYYYMMDD-XXXXXX

✅ **Get My Orders**
- Request: `Orders → Get My Orders`
- Xem lịch sử đơn hàng
- Pagination: page=0, size=10

### ❤️ **Wishlist Module**
✅ **Add to Wishlist**
- Request: `Wishlist → Add to Wishlist`
- Yêu cầu: productId
- Lưu sản phẩm yêu thích

✅ **Get Wishlist**
- Request: `Wishlist → Get Wishlist`
- Xem danh sách yêu thích

### ⭐ **Reviews Module**
✅ **Create Review**
- Request: `Reviews → Create Review`
- Rating: 1-5
- Bắt buộc: Đã mua sản phẩm này trước đó

✅ **Get Product Reviews**
- Request: `Reviews → Get Product Reviews`
- Xem bình luận của sản phẩm
- ProductId: 1

### 🎁 **Vouchers Module**
✅ **Get All Vouchers**
- Request: `Vouchers → Get All Vouchers`
- Liệt kê các voucher có sẵn

✅ **Validate Voucher**
- Request: `Vouchers → Validate Voucher`
- Code: "SAVE10" (nếu tồn tại)
- OrderAmount: 500000
- Kết quả: discount amount

### 💡 **Recommendations Module**
✅ **Personalized Recommendations**
- Request: `Recommendations → Personalized Recommendations`
- Cần token
- Dựa vào lịch sử mua của user

✅ **Guest Recommendations**
- Request: `Recommendations → Guest Recommendations`
- Không cần token
- Top trending + top rated products

✅ **Similar Products**
- Request: `Recommendations → Similar Products`
- ProductId: 1
- Sản phẩm cùng category

### 👤 **User Profile Module**
✅ **Get My Profile**
- Request: `User Profile → Get My Profile`
- Cần token
- Thông tin user hiện tại

✅ **Update Profile**
- Request: `User Profile → Update Profile`
- Cập nhật name, phone, address

### 📊 **Admin Dashboard**
✅ **Dashboard Stats**
- Request: `Admin → Dashboard`
- Cần role ADMIN
- Thống kê: tổng đơn, user, revenue...

✅ **Revenue Report**
- Request: `Admin → Revenue Report`
- Cần role ADMIN
- Doanh thu theo tháng

---

## Step 5: Automatic Token Management

### Option 1: Manual Token Management
1. After Login, copy `accessToken`
2. Click Environment → Set `{{token}}`
3. Mỗi lần token hết hạn, đăng nhập lại

### Option 2: Auto Token с Pre-request Script
1. Chọn Collection → **Pre-request Scripts**
2. Thêm code (nếu cần auto refresh)

```javascript
// Nếu token hết hạn, tự động gọi login
if (!pm.environment.get("token")) {
    // Gọi login request và lưu token
    pm.sendRequest({
        url: pm.environment.get("base_url") + "/api/auth/login",
        method: "POST",
        body: {
            mode: "raw",
            raw: JSON.stringify({
                email: "user1@example.com",
                password: "Password@123"
            })
        }
    }, function (err, response) {
        if (!err) {
            var token = response.json().accessToken;
            pm.environment.set("token", token);
        }
    });
}
```

---

## Step 6: Troubleshooting Common Errors

### ❌ Error 401 Unauthorized
**Nguyên nhân:** Token hết hạn hoặc không hợp lệ
- **Giải pháp:** Đăng nhập lại → Copy token mới → Update `{{token}}`

### ❌ Error 403 Forbidden
**Nguyên nhân:** Không có quyền (cần ADMIN)
- **Giải pháp:** 
  - Kiểm tra role của user
  - Sử dụng tài khoản ADMIN nếu cần

### ❌ Error 404 Not Found
**Nguyên nhân:** Resource không tồn tại (productId, etc.)
- **Giải pháp:** Kiểm tra ID, GET list trước để xác định ID đúng

### ❌ Error 500 Internal Server Error
**Nguyên nhân:** Lỗi server
- **Kiểm tra:**
  1. Server đang chạy? → Check http://localhost:8080
  2. Database connected? → Check logs
  3. Email config? → Check application.properties nếu gửi email

### ❌ Connection Refused (localhost:8080)
**Nguyên nhân:** Server không chạy
- **Giải pháp:** 
  ```bash
  cd d:\Fashionable-Shop-Website\fashion-shop
  java -jar target/fashion-shop-0.0.1-SNAPSHOT.jar
  ```

---

## Step 7: Complete Testing Checklist

### 🟢 Authentication
- [ ] Register new account
- [ ] Login successfully
- [ ] Token saved in variable
- [ ] Token valid for next requests

### 🟢 Products
- [ ] View all products (GET)
- [ ] Search products by keyword
- [ ] View product details
- [ ] Create product as ADMIN
- [ ] Filter by category

### 🟢 Categories
- [ ] View all categories
- [ ] Create category as ADMIN

### 🟢 Cart & Orders
- [ ] Add product to cart
- [ ] View cart
- [ ] Remove from cart
- [ ] Create order (checkout)
- [ ] View my orders
- [ ] View order details

### 🟢 Wishlist
- [ ] Add to wishlist
- [ ] View wishlist
- [ ] Remove from wishlist

### 🟢 Reviews
- [ ] Create review
- [ ] View product reviews

### 🟢 Vouchers
- [ ] View all vouchers
- [ ] Validate voucher code

### 🟢 Recommendations
- [ ] Get personalized (with token)
- [ ] Get guest recommendations
- [ ] Get similar products
- [ ] Get trending products

### 🟢 Admin Features
- [ ] View dashboard
- [ ] View revenue report
- [ ] View user stats

### 🟢 User Profile
- [ ] View my profile
- [ ] Update profile information

---

## Step 8: Tips & Best Practices

### ⭐ Pro Tips
1. **Save Environment:** Ctrl+S để lưu environment
2. **Use Variables:** {{base_url}} và {{token}} được tái sử dụng
3. **Copy Collection URL:** Right-click → Copy as cURL để debug
4. **Verify Response:** Kiểm tra JSON response format
5. **Use Tests Tab:** Thêm test scripts để auto verify

### 🔒 Security Notes
- ⚠️ Không commit Postman collection với token real
- ⚠️ Không share token qua chat/email
- ⚠️ Token hết hạn sau ~24 giờ (hoặc cấu hình)
- ⚠️ Refresh token để lấy token mới nếu cần

### 📊 Performance Tips
- Sử dụng pagination (page=0, size=10)
- Hạn chế gọi API quá nhanh
- Check database logs nếu response chậm
- Xóa lịch sử request cũ để tiết kiệm memory

---

## Step 9: Sử Dụng Collection Variables trong Body

### Ví dụ: Sử dụng {{base_url}} trong URL
```
{{base_url}}/api/products
→ Trở thành: http://localhost:8080/api/products
```

### Ví dụ: Sử dụng {{token}} trong Header
```
Header: Authorization
Value: Bearer {{token}}
→ Trở thành: Bearer eyJhbGciOiJIUzUxMiJ9...
```

---

## Step 10: Export & Share Collection

### Để chia sẻ Collection:
1. **Right-click Collection → Export**
2. **Format:** JSON (default)
3. **Save file** và chia sẻ cho team

---

## 📞 Support & Questions

**Nếu gặp lỗi:**
1. Kiểm tra Server logs: `http://localhost:8080/actuator/health`
2. Kiểm tra Database: Kết nối MySQL?
3. Check Email config: Nếu test email functionality
4. Xem file: `application.properties` - configuration đúng?

**Server chạy tính từ bước nào?**
```
java -jar target/fashion-shop-0.0.1-SNAPSHOT.jar
Expected: "Tomcat started on port 8080"
```

---

**Chúc bạn testing thành công! 🚀**
