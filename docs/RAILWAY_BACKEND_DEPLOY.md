# Deploy backend lên Railway bằng GitHub

## 1. Những gì đã được setup trong repo

- `railway.json`: ép Railway build đúng thư mục `backend/`
- `backend/.env.properties.example`: mẫu biến môi trường cần khai báo
- `application.properties`: đã hỗ trợ `PORT`, proxy HTTPS và URL production
- `SecurityConfig`: CORS đọc từ biến môi trường
- `.gitignore`: chặn commit `backend/.env.properties`

## 2. Cách deploy

1. Push code mới nhất lên GitHub.
2. Vào Railway -> **New Project** -> **Deploy from GitHub repo**.
3. Chọn repo này.
4. Railway sẽ tự dùng `railway.json` để build/start backend.
5. Sau khi tạo service, vào **Variables** và thêm các biến trong `backend/.env.properties.example`.
6. Nếu dùng MySQL trên Railway, tạo thêm một **MySQL service** rồi map các giá trị host/user/password/db sang:
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATASOURCE_USERNAME`
   - `SPRING_DATASOURCE_PASSWORD`

## 3. Biến môi trường tối thiểu

### Bắt buộc
- `APP_BASE_URL`
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

### Nếu dùng frontend tách riêng
- `FRONTEND_URL`
- `APP_CORS_ALLOWED_ORIGINS`

### Nếu dùng Google login / VNPay / email
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`
- `SPRING_MAIL_USERNAME`
- `SPRING_MAIL_PASSWORD`

## 4. Lưu ý quan trọng

- Google OAuth redirect URI production nên là:
  `https://<your-railway-domain>/login/oauth2/code/google`
- VNPay IPN URL nên là:
  `https://<your-railway-domain>/api/payments/vnpay/ipn`
- Nếu frontend deploy ở domain khác, nhớ thêm domain đó vào `APP_CORS_ALLOWED_ORIGINS`.
- Không đưa file `backend/.env.properties` thật lên GitHub.
