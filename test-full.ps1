$ErrorActionPreference = "Continue"
$base = "http://localhost:8080/api"
. (Join-Path $PSScriptRoot "config-helper.ps1")
$passed = 0
$failed = 0
$failDetails = @()

function Api {
    param([string]$Name, [string]$Method, [string]$Url, [string]$Body=$null, [string]$Token=$null, [int[]]$Expected=@(200,201))
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    if ($Body) { $headers["Content-Type"] = "application/json" }
    $params = @{ Uri=$Url; Method=$Method; Headers=$headers; SkipHttpErrorCheck=$true; UseBasicParsing=$true }
    if ($Body -and $Method -notin @("GET","DELETE")) { $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body) }
    $resp = Invoke-WebRequest @params
    $status = $resp.StatusCode
    $json = try { $resp.Content | ConvertFrom-Json } catch { $null }
    $pass = $Expected -contains $status
    if ($pass) { $script:passed++ } else { $script:failed++; $script:failDetails += "  FAIL: $Name => $status (expect $($Expected -join ',')) $($json.message)" }
    $icon = if($pass){"OK"}else{"XX"}
    Write-Host "[$icon] $Name => $status"
    return @{ S=$status; J=$json; P=$pass; C=$resp.Content }
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Write-Host "=== FASHION SHOP API TEST ($ts) ===`n"

# ===== AUTH =====
Write-Host "--- AUTH ---"
$userEmail = "user$ts@test.com"
$r = Api "Register" "POST" "$base/auth/register" (@{email=$userEmail;password="Test1234!";fullName="Test User";phone="0123456789"} | ConvertTo-Json)
$userToken = $r.J.data.accessToken
$userId = $r.J.data.user.id

$r = Api "Login" "POST" "$base/auth/login" (@{email=$userEmail;password="Test1234!"} | ConvertTo-Json)
$userToken = $r.J.data.accessToken
$userRefresh = $r.J.data.refreshToken

Api "Login Bad Pass" "POST" "$base/auth/login" (@{email=$userEmail;password="wrong"} | ConvertTo-Json) -Expected @(401,400)
Api "Register Bad Email" "POST" "$base/auth/register" (@{email="bad";password="Test1234!";fullName="T";phone=""} | ConvertTo-Json) -Expected @(400)

$r = Api "Refresh Token" "POST" "$base/auth/refresh" (@{refreshToken=$userRefresh} | ConvertTo-Json)
if ($r.J.data.accessToken) { $userToken = $r.J.data.accessToken }

Api "Refresh Invalid" "POST" "$base/auth/refresh" (@{refreshToken="invalid"} | ConvertTo-Json) -Expected @(400,401)

$r = Api "Google OAuth2 New" "POST" "$base/auth/google" (@{googleId="g$ts";email="g$ts@gmail.com";fullName="Google User"} | ConvertTo-Json)
$googleToken = $r.J.data.accessToken

$r = Api "Google OAuth2 Existing" "POST" "$base/auth/google" (@{googleId="g$ts";email="g$ts@gmail.com";fullName="Google User"} | ConvertTo-Json)
Api "Google Missing Fields" "POST" "$base/auth/google" (@{googleId="";email="";fullName=""} | ConvertTo-Json) -Expected @(400)

Api "Forgot Password" "POST" "$base/auth/forgot-password" (@{email=$userEmail} | ConvertTo-Json) -Expected @(200,500)
Api "Reset Invalid Token" "POST" "$base/auth/reset-password" (@{token="bad";newPassword="New1234!"} | ConvertTo-Json) -Expected @(400)

# ===== ADMIN SETUP =====
$adminEmail = "adm$ts@test.com"
Api "Register Admin" "POST" "$base/auth/register" (@{email=$adminEmail;password="Admin1234!";fullName="Admin";phone="0987"} | ConvertTo-Json)
Invoke-ConfiguredMySql "UPDATE users SET role='ADMIN' WHERE email='$adminEmail';"
$r = Api "Login Admin" "POST" "$base/auth/login" (@{email=$adminEmail;password="Admin1234!"} | ConvertTo-Json)
$adminToken = $r.J.data.accessToken

# ===== USERS =====
Write-Host "`n--- USERS ---"
Api "Get Profile" "GET" "$base/users/profile" -Token $userToken
Api "No Auth Profile" "GET" "$base/users/profile" -Expected @(401)
Api "Update Profile" "PUT" "$base/users/profile" (@{fullName="Updated";phone="0111";address="123 St"} | ConvertTo-Json) -Token $userToken
Api "Get User by ID" "GET" "$base/users/$userId" -Token $userToken
Api "Admin List Users" "GET" "$base/users?page=0&size=5" -Token $adminToken
Api "User List Users" "GET" "$base/users?page=0&size=5" -Token $userToken -Expected @(403)

# ===== CATEGORIES =====
Write-Host "`n--- CATEGORIES ---"
$r = Api "Create Category" "POST" "$base/categories" (@{name="Cat$ts";slug="cat-$ts";description="Test"} | ConvertTo-Json) -Token $adminToken
$catId = $r.J.data.id

$r = Api "Create Subcategory" "POST" "$base/categories" (@{name="Sub$ts";slug="sub-$ts";description="Sub";parentId=$catId} | ConvertTo-Json) -Token $adminToken
$subCatId = $r.J.data.id

Api "Get Categories" "GET" "$base/categories"
Api "Get Category ID" "GET" "$base/categories/$catId"
Api "Get Category Slug" "GET" "$base/categories/slug/cat-$ts"
Api "Get Subcategories" "GET" "$base/categories/$catId/children"
Api "Update Category" "PUT" "$base/categories/$catId" (@{name="Updated$ts";slug="cat-$ts";description="Upd"} | ConvertTo-Json) -Token $adminToken
Api "Create Cat No Auth" "POST" "$base/categories" (@{name="X";slug="x"} | ConvertTo-Json) -Expected @(401)
Api "Create Cat User" "POST" "$base/categories" (@{name="X";slug="x"} | ConvertTo-Json) -Token $userToken -Expected @(403)

# ===== PRODUCTS =====
Write-Host "`n--- PRODUCTS ---"
$r = Api "Create Product" "POST" "$base/products" (@{name="Prod$ts";slug="prod-$ts";description="Test product";price=250000;salePrice=200000;stock=100;categoryId=$catId;brand="Brand"} | ConvertTo-Json) -Token $adminToken
$prodId = $r.J.data.id

$r = Api "Create Product 2" "POST" "$base/products" (@{name="Prod2$ts";slug="prod2-$ts";description="Second";price=500000;stock=50;categoryId=$catId;brand="B2"} | ConvertTo-Json) -Token $adminToken
$prodId2 = $r.J.data.id

Api "Get Products" "GET" "$base/products"
Api "Get Product ID" "GET" "$base/products/$prodId"
Api "Get Product Slug" "GET" "$base/products/slug/prod-$ts"
Api "Search Products" "GET" "$base/products/search?q=Prod"
Api "Filter Products" "GET" "$base/products?categoryId=$catId&minPrice=100000&maxPrice=600000"
Api "Featured Products" "GET" "$base/products/featured"
Api "Update Product" "PUT" "$base/products/$prodId" (@{name="ProdUpd$ts";price=300000} | ConvertTo-Json) -Token $adminToken
Api "Create Prod No Auth" "POST" "$base/products" (@{name="X";slug="x";price=1} | ConvertTo-Json) -Expected @(401)
Api "Get Nonexistent Prod" "GET" "$base/products/999999" -Expected @(404)

# ===== CART =====
Write-Host "`n--- CART ---"
Api "Get Empty Cart" "GET" "$base/carts" -Token $userToken
$r = Api "Add to Cart" "POST" "$base/carts/add" (@{productId=$prodId;quantity=2} | ConvertTo-Json) -Token $userToken
$cartItemId = if ($r.J.data.items) { $r.J.data.items[0].id } else { $null }
Api "Add Product 2" "POST" "$base/carts/add" (@{productId=$prodId2;quantity=1} | ConvertTo-Json) -Token $userToken
Api "Get Cart" "GET" "$base/carts" -Token $userToken
if ($cartItemId) { Api "Update Cart Item" "PUT" "$base/carts/update" (@{cartItemId=$cartItemId;quantity=3} | ConvertTo-Json) -Token $userToken }
Api "Cart No Auth" "GET" "$base/carts" -Expected @(401)

# ===== WISHLIST =====
Write-Host "`n--- WISHLIST ---"
Api "Get Wishlist" "GET" "$base/wishlists" -Token $userToken
Api "Add to Wishlist" "POST" "$base/wishlists/$prodId" -Token $userToken
Api "Add to Wishlist 2" "POST" "$base/wishlists/$prodId2" -Token $userToken
Api "Check Wishlist" "GET" "$base/wishlists/check/$prodId" -Token $userToken
Api "Wishlist Count" "GET" "$base/wishlists/count" -Token $userToken
Api "Remove Wishlist" "DELETE" "$base/wishlists/$prodId2" -Token $userToken
Api "Wishlist No Auth" "GET" "$base/wishlists" -Expected @(401)

# ===== ORDERS =====
Write-Host "`n--- ORDERS ---"
$r = Api "Create Order COD" "POST" "$base/orders" (@{shippingAddress="123 St HCM";phone="0123456789";paymentMethod="COD"} | ConvertTo-Json) -Token $userToken
$orderId = $r.J.data.id
$orderCode = $r.J.data.orderCode

if ($orderId) { Api "Get Order ID" "GET" "$base/orders/$orderId" }
if ($orderCode) { Api "Get Order Code" "GET" "$base/orders/code/$orderCode" }
Api "My Orders" "GET" "$base/orders/my-orders" -Token $userToken

# Re-add to cart for VNPay order
Api "Re-add Cart" "POST" "$base/carts/add" (@{productId=$prodId;quantity=1} | ConvertTo-Json) -Token $userToken
$r = Api "Create Order VNPay" "POST" "$base/orders" (@{shippingAddress="456 VNPay St";phone="0987654321";paymentMethod="VNPAY"} | ConvertTo-Json) -Token $userToken
$vnpayOrderId = $r.J.data.id
$vnpayOrderCode = $r.J.data.orderCode

Api "Order Empty Cart" "POST" "$base/orders" (@{shippingAddress="X";phone="0";paymentMethod="COD"} | ConvertTo-Json) -Token $userToken -Expected @(400)
if ($orderId) { Api "Cancel Order" "PUT" "$base/orders/$orderId/cancel" -Token $userToken }
if ($vnpayOrderId) { Api "Admin Update Status" "PUT" "$base/orders/$vnpayOrderId/status?status=PROCESSING" -Token $adminToken }

# ===== VNPAY PAYMENT =====
Write-Host "`n--- VNPAY PAYMENT ---"
if ($vnpayOrderId) {
    $r = Api "Create VNPay URL" "POST" "$base/payments/vnpay/create?orderId=$vnpayOrderId&returnUrl=http://localhost:3000/payment-result"
    if ($r.J.data.paymentUrl) { Write-Host "  URL: $($r.J.data.paymentUrl.Substring(0, [Math]::Min(120, $r.J.data.paymentUrl.Length)))..." }
    Api "Get Payment" "GET" "$base/payments/order/$vnpayOrderId"
}
Api "VNPay Bad Order" "POST" "$base/payments/vnpay/create?orderId=999999" -Expected @(404,400,500)
Api "VNPay Return Bad Hash" "GET" "$base/payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=invalid" -Expected @(200,400,500)
Api "VNPay IPN Bad Hash" "POST" "$base/payments/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=invalid" -Expected @(200)

# ===== VOUCHERS =====
Write-Host "`n--- VOUCHERS ---"
$r = Api "Create Voucher %" "POST" "$base/vouchers" (@{code="SAVE$ts";discountType="PERCENT";discountValue=10;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";minOrderValue=100000;maxDiscount=50000;quantity=100;status="ACTIVE"} | ConvertTo-Json) -Token $adminToken
$voucherId = $r.J.data.id
$voucherCode = $r.J.data.code

$r = Api "Create Voucher Amt" "POST" "$base/vouchers" (@{code="FLAT$ts";discountType="AMOUNT";discountValue=50000;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";quantity=50;status="ACTIVE"} | ConvertTo-Json) -Token $adminToken
$voucherId2 = $r.J.data.id

Api "Get Active Vouchers" "GET" "$base/vouchers"
Api "Get Voucher Code" "GET" "$base/vouchers/$voucherCode"
Api "Validate Voucher" "POST" "$base/vouchers/validate?code=$voucherCode&orderAmount=200000"
Api "Validate Bad Code" "POST" "$base/vouchers/validate?code=INVALID&orderAmount=100" -Expected @(404,400)
Api "Admin All Vouchers" "GET" "$base/vouchers/admin/all" -Token $adminToken
Api "Create Voucher NoAuth" "POST" "$base/vouchers" (@{code="X";discountType="PERCENT";discountValue=5;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59"} | ConvertTo-Json) -Expected @(401)

# ===== REVIEWS =====
Write-Host "`n--- REVIEWS ---"
$r = Api "Create Review" "POST" "$base/reviews" (@{productId=$prodId;rating=5;comment="Great!"} | ConvertTo-Json) -Token $userToken
$reviewId = $r.J.data.id

if ($reviewId) {
    Api "Get Review" "GET" "$base/reviews/$reviewId"
    Api "Update Review" "PUT" "$base/reviews/$reviewId" (@{rating=4;comment="Updated"} | ConvertTo-Json) -Token $userToken
}
Api "Product Reviews" "GET" "$base/reviews/product/$prodId"
Api "Product Rating" "GET" "$base/reviews/product/$prodId/rating"
Api "Product Review Count" "GET" "$base/reviews/product/$prodId/count"
Api "My Reviews" "GET" "$base/reviews/my-reviews" -Token $userToken
Api "Review No Auth" "POST" "$base/reviews" (@{productId=$prodId;rating=3;comment="X"} | ConvertTo-Json) -Expected @(401)

# ===== RECOMMENDATIONS =====
Write-Host "`n--- RECOMMENDATIONS ---"
Api "Guest Recs" "GET" "$base/recommendations/guest?limit=5"
Api "Personal Recs" "GET" "$base/recommendations/personalized?limit=5" -Token $userToken
Api "Similar Prods" "GET" "$base/recommendations/similar/$prodId?limit=5"
Api "Trending" "GET" "$base/recommendations/trending?limit=5"

# ===== ADMIN STATS =====
Write-Host "`n--- ADMIN STATS ---"
Api "Dashboard" "GET" "$base/admin/dashboard" -Token $adminToken
Api "Revenue" "GET" "$base/admin/reports/revenue" -Token $adminToken
Api "Product Stats" "GET" "$base/admin/reports/products" -Token $adminToken
Api "User Stats" "GET" "$base/admin/reports/users" -Token $adminToken
Api "Order Stats" "GET" "$base/admin/reports/orders" -Token $adminToken
Api "Dashboard NoAuth" "GET" "$base/admin/dashboard" -Expected @(401)
Api "Dashboard User" "GET" "$base/admin/dashboard" -Token $userToken -Expected @(403)

# ===== CLEANUP =====
Write-Host "`n--- CLEANUP ---"
if ($reviewId) { Api "Delete Review" "DELETE" "$base/reviews/$reviewId" -Token $userToken }
if ($voucherId2) { Api "Delete Voucher" "DELETE" "$base/vouchers/$voucherId2" -Token $adminToken }
Api "Clear Wishlist" "DELETE" "$base/wishlists" -Token $userToken
if ($subCatId) { Api "Delete Subcategory" "DELETE" "$base/categories/$subCatId" -Token $adminToken }

# ===== SUMMARY =====
Write-Host "`n=========================================="
Write-Host "  PASSED: $passed"
Write-Host "  FAILED: $failed"
Write-Host "  TOTAL:  $($passed + $failed)"
Write-Host "=========================================="
if ($failDetails.Count -gt 0) {
    Write-Host "`nFailed tests:"
    $failDetails | ForEach-Object { Write-Host $_ }
}
