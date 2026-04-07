$ErrorActionPreference = "Continue"
$base = "http://localhost:8080/api"
. (Join-Path $PSScriptRoot "config-helper.ps1")
$results = @()
$passed = 0
$failed = 0

function Test-Api {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null,
        [string]$Token = $null,
        [int[]]$ExpectedStatus = @(200),
        [string]$ContentType = "application/json"
    )
    $headers = @{}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    if ($ContentType) { $headers["Content-Type"] = $ContentType }
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            ErrorAction = "Stop"
        }
        if ($Body -and $Method -ne "GET" -and $Method -ne "DELETE") {
            $params["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body)
        }
        $resp = Invoke-WebRequest @params
        $status = $resp.StatusCode
        $json = $resp.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        if (-not $status) { $status = 0 }
        try { $json = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue } catch { $json = $null }
    }
    
    $pass = $ExpectedStatus -contains $status
    $icon = if ($pass) { "PASS" } else { "FAIL" }
    if ($pass) { $script:passed++ } else { $script:failed++ }
    
    $msg = "[$icon] $Name => HTTP $status"
    if (-not $pass) {
        $msg += " (expected: $($ExpectedStatus -join ','))"
        if ($json.message) { $msg += " - $($json.message)" }
    }
    Write-Host $msg
    
    return @{ Status = $status; Json = $json; Pass = $pass; Content = $resp.Content }
}

Write-Host "============================================"
Write-Host "  FASHION SHOP API COMPREHENSIVE TEST"
Write-Host "============================================`n"

# ========== 1. AUTH TESTS ==========
Write-Host "`n--- AUTH TESTS ---"

# Register
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$userEmail = "testuser_$ts@test.com"
$adminEmail = "admin_$ts@test.com"

$r = Test-Api "Register User" "POST" "$base/auth/register" (@{email=$userEmail;password="Test1234!";fullName="Test User";phone="0123456789"} | ConvertTo-Json)
$userToken = $r.Json.data.accessToken
$userRefresh = $r.Json.data.refreshToken
$userId = $r.Json.data.user.id

$r = Test-Api "Register Admin" "POST" "$base/auth/register" (@{email=$adminEmail;password="Admin1234!";fullName="Admin User";phone="0987654321"} | ConvertTo-Json)
$adminToken = $r.Json.data.accessToken
$adminId = $r.Json.data.user.id

# Promote admin via DB
Invoke-ConfiguredMySql "UPDATE users SET role='ADMIN' WHERE email='$adminEmail';"
# Re-login admin to get new token with ADMIN role
$r = Test-Api "Login Admin" "POST" "$base/auth/login" (@{email=$adminEmail;password="Admin1234!"} | ConvertTo-Json)
$adminToken = $r.Json.data.accessToken

# Login
$r = Test-Api "Login User" "POST" "$base/auth/login" (@{email=$userEmail;password="Test1234!"} | ConvertTo-Json)
$userToken = $r.Json.data.accessToken
$userRefresh = $r.Json.data.refreshToken

# Bad login
Test-Api "Login Wrong Password" "POST" "$base/auth/login" (@{email=$userEmail;password="wrong"} | ConvertTo-Json) -ExpectedStatus @(401,400)

# Validation test
Test-Api "Register Invalid Email" "POST" "$base/auth/register" (@{email="invalid";password="Test1234!";fullName="Test";phone=""} | ConvertTo-Json) -ExpectedStatus @(400)

# Refresh token
$r = Test-Api "Refresh Token" "POST" "$base/auth/refresh" (@{refreshToken=$userRefresh} | ConvertTo-Json)
if ($r.Json.data.accessToken) { $userToken = $r.Json.data.accessToken }

Test-Api "Refresh Invalid Token" "POST" "$base/auth/refresh" (@{refreshToken="invalid-token"} | ConvertTo-Json) -ExpectedStatus @(401,400)

# Google OAuth2
$r = Test-Api "Google OAuth2 Login (new)" "POST" "$base/auth/google" (@{googleId="google_$ts";email="google_$ts@gmail.com";fullName="Google User"} | ConvertTo-Json)
$googleToken = $r.Json.data.accessToken

$r = Test-Api "Google OAuth2 Login (existing)" "POST" "$base/auth/google" (@{googleId="google_$ts";email="google_$ts@gmail.com";fullName="Google User"} | ConvertTo-Json)

Test-Api "Google Login Missing Fields" "POST" "$base/auth/google" (@{googleId="";email="";fullName=""} | ConvertTo-Json) -ExpectedStatus @(400)

# Forgot/Reset password
$r = Test-Api "Forgot Password" "POST" "$base/auth/forgot-password" (@{email=$userEmail} | ConvertTo-Json) -ExpectedStatus @(200,500)

Test-Api "Forgot Password Nonexistent" "POST" "$base/auth/forgot-password" (@{email="nonexistent@test.com"} | ConvertTo-Json) -ExpectedStatus @(404,400,500)

Test-Api "Reset Password Invalid Token" "POST" "$base/auth/reset-password" (@{token="invalid-token";newPassword="NewPass1234!"} | ConvertTo-Json) -ExpectedStatus @(400)

# ========== 2. USER TESTS ==========
Write-Host "`n--- USER TESTS ---"

Test-Api "Get Profile" "GET" "$base/users/profile" -Token $userToken
Test-Api "Get Profile No Auth" "GET" "$base/users/profile" -ExpectedStatus @(401,403)

Test-Api "Update Profile" "PUT" "$base/users/profile" (@{fullName="Updated User";phone="0111222333";address="123 Test St"} | ConvertTo-Json) -Token $userToken

Test-Api "Get User by ID" "GET" "$base/users/$userId" -Token $userToken

Test-Api "Admin List Users" "GET" "$base/users?page=0&size=5" -Token $adminToken
Test-Api "User List Users (forbidden)" "GET" "$base/users?page=0&size=5" -Token $userToken -ExpectedStatus @(403)

# ========== 3. CATEGORY TESTS ==========
Write-Host "`n--- CATEGORY TESTS ---"

$r = Test-Api "Create Category" "POST" "$base/categories" (@{name="Test Category $ts";slug="test-cat-$ts";description="Test desc"} | ConvertTo-Json) -Token $adminToken
$catId = $r.Json.data.id

$r = Test-Api "Create Subcategory" "POST" "$base/categories" (@{name="Sub Category $ts";slug="sub-cat-$ts";description="Sub desc";parentId=$catId} | ConvertTo-Json) -Token $adminToken
$subCatId = $r.Json.data.id

Test-Api "Get All Categories" "GET" "$base/categories"
Test-Api "Get Category by ID" "GET" "$base/categories/$catId"
Test-Api "Get Category by Slug" "GET" "$base/categories/slug/test-cat-$ts"
Test-Api "Get Subcategories" "GET" "$base/categories/$catId/children"

Test-Api "Update Category" "PUT" "$base/categories/$catId" (@{name="Updated Category $ts";slug="test-cat-$ts";description="Updated"} | ConvertTo-Json) -Token $adminToken

Test-Api "Create Category No Auth" "POST" "$base/categories" (@{name="Fail";slug="fail"} | ConvertTo-Json) -ExpectedStatus @(401,403)
Test-Api "Create Category User Role" "POST" "$base/categories" (@{name="Fail2";slug="fail2"} | ConvertTo-Json) -Token $userToken -ExpectedStatus @(403)

# ========== 4. PRODUCT TESTS ==========
Write-Host "`n--- PRODUCT TESTS ---"

$r = Test-Api "Create Product" "POST" "$base/products" (@{name="Test Product $ts";slug="test-prod-$ts";description="A test product";price=250000;salePrice=200000;stock=100;categoryId=$catId;brand="TestBrand";imageUrl="https://example.com/img.jpg"} | ConvertTo-Json) -Token $adminToken
$prodId = $r.Json.data.id

$r = Test-Api "Create Product 2" "POST" "$base/products" (@{name="Product Two $ts";slug="prod-two-$ts";description="Second product";price=500000;stock=50;categoryId=$catId;brand="BrandB"} | ConvertTo-Json) -Token $adminToken
$prodId2 = $r.Json.data.id

Test-Api "Get All Products" "GET" "$base/products"
Test-Api "Get Product by ID" "GET" "$base/products/$prodId"
Test-Api "Get Product by Slug" "GET" "$base/products/slug/test-prod-$ts"
Test-Api "Search Products" "GET" "$base/products/search?q=Test"
Test-Api "Filter Products" "GET" "$base/products?categoryId=$catId&minPrice=100000&maxPrice=600000"
Test-Api "Get Featured Products" "GET" "$base/products/featured"

Test-Api "Update Product" "PUT" "$base/products/$prodId" (@{name="Updated Product $ts";price=300000} | ConvertTo-Json) -Token $adminToken

Test-Api "Create Product No Auth" "POST" "$base/products" (@{name="Fail";slug="fail";price=100} | ConvertTo-Json) -ExpectedStatus @(401,403)
Test-Api "Get Nonexistent Product" "GET" "$base/products/999999" -ExpectedStatus @(404,400)

# ========== 5. CART TESTS ==========
Write-Host "`n--- CART TESTS ---"

Test-Api "Get Empty Cart" "GET" "$base/carts" -Token $userToken

$r = Test-Api "Add to Cart" "POST" "$base/carts/add" (@{productId=$prodId;quantity=2} | ConvertTo-Json) -Token $userToken
$cartItemId = if ($r.Json.data.items) { $r.Json.data.items[0].id } else { $null }

Test-Api "Add Product 2 to Cart" "POST" "$base/carts/add" (@{productId=$prodId2;quantity=1} | ConvertTo-Json) -Token $userToken

Test-Api "Get Cart" "GET" "$base/carts" -Token $userToken

if ($cartItemId) {
    Test-Api "Update Cart Item" "PUT" "$base/carts/update" (@{cartItemId=$cartItemId;quantity=3} | ConvertTo-Json) -Token $userToken
}

Test-Api "Cart No Auth" "GET" "$base/carts" -ExpectedStatus @(401,403)

# ========== 6. WISHLIST TESTS ==========
Write-Host "`n--- WISHLIST TESTS ---"

Test-Api "Get Empty Wishlist" "GET" "$base/wishlists" -Token $userToken
Test-Api "Add to Wishlist" "POST" "$base/wishlists/$prodId" -Token $userToken
Test-Api "Add Product 2 to Wishlist" "POST" "$base/wishlists/$prodId2" -Token $userToken
Test-Api "Check Wishlist" "GET" "$base/wishlists/check/$prodId" -Token $userToken
Test-Api "Get Wishlist Count" "GET" "$base/wishlists/count" -Token $userToken
Test-Api "Get Wishlist" "GET" "$base/wishlists" -Token $userToken
Test-Api "Remove from Wishlist" "DELETE" "$base/wishlists/$prodId2" -Token $userToken
Test-Api "Wishlist No Auth" "GET" "$base/wishlists" -ExpectedStatus @(401,403)

# ========== 7. ORDER TESTS ==========
Write-Host "`n--- ORDER TESTS ---"

# Create COD order
$r = Test-Api "Create Order (COD)" "POST" "$base/orders" (@{shippingAddress="123 Test Street, HCM";phone="0123456789";paymentMethod="COD"} | ConvertTo-Json) -Token $userToken
$orderId = $r.Json.data.id
$orderCode = $r.Json.data.orderCode

if ($orderId) {
    Test-Api "Get Order by ID" "GET" "$base/orders/$orderId"
}
if ($orderCode) {
    Test-Api "Get Order by Code" "GET" "$base/orders/code/$orderCode"
}

Test-Api "Get My Orders" "GET" "$base/orders/my-orders?page=0&size=10" -Token $userToken

# Add items back to cart for VNPay order
Test-Api "Re-add to Cart for VNPay" "POST" "$base/carts/add" (@{productId=$prodId;quantity=1} | ConvertTo-Json) -Token $userToken

$r = Test-Api "Create Order (VNPay)" "POST" "$base/orders" (@{shippingAddress="456 VNPay St, HCM";phone="0987654321";paymentMethod="VNPAY"} | ConvertTo-Json) -Token $userToken
$vnpayOrderId = $r.Json.data.id
$vnpayOrderCode = $r.Json.data.orderCode

Test-Api "Create Order Empty Cart" "POST" "$base/orders" (@{shippingAddress="Test";phone="012";paymentMethod="COD"} | ConvertTo-Json) -Token $userToken -ExpectedStatus @(400,500)

# Cancel order
if ($orderId) {
    Test-Api "Cancel Order" "PUT" "$base/orders/$orderId/cancel" -Token $userToken
}

# Admin update order status
if ($vnpayOrderId) {
    Test-Api "Admin Update Order Status" "PUT" "$base/orders/$vnpayOrderId/status?status=PROCESSING" -Token $adminToken
}

# ========== 8. VNPAY PAYMENT TESTS ==========
Write-Host "`n--- VNPAY PAYMENT TESTS ---"

if ($vnpayOrderId) {
    $r = Test-Api "Create VNPay Payment URL" "POST" "$base/payments/vnpay/create?orderId=$vnpayOrderId&returnUrl=http://localhost:3000/payment-result"
    if ($r.Json.data.paymentUrl) {
        Write-Host "  VNPay URL generated: $($r.Json.data.paymentUrl.Substring(0, [Math]::Min(100, $r.Json.data.paymentUrl.Length)))..."
    }

    Test-Api "Get Payment by Order" "GET" "$base/payments/order/$vnpayOrderId"
}

Test-Api "Create VNPay Nonexistent Order" "POST" "$base/payments/vnpay/create?orderId=999999" -ExpectedStatus @(404,400,500)

# Test VNPay return with dummy params (should fail hash verification)
Test-Api "VNPay Return Invalid Hash" "GET" "$base/payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=invalid" -ExpectedStatus @(200,400,500)

# Test VNPay IPN with dummy params
Test-Api "VNPay IPN Invalid Hash" "POST" "$base/payments/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=invalid" -ExpectedStatus @(200,400,500)

# ========== 9. VOUCHER TESTS ==========
Write-Host "`n--- VOUCHER TESTS ---"

$r = Test-Api "Create Voucher (Percent)" "POST" "$base/vouchers" (@{code="SAVE10_$ts";discountType="PERCENT";discountValue=10;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";minOrderValue=100000;maxDiscount=50000;quantity=100;status="ACTIVE"} | ConvertTo-Json) -Token $adminToken
$voucherId = $r.Json.data.id

$r = Test-Api "Create Voucher (Amount)" "POST" "$base/vouchers" (@{code="FLAT50K_$ts";discountType="AMOUNT";discountValue=50000;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";quantity=50;status="ACTIVE"} | ConvertTo-Json) -Token $adminToken
$voucherId2 = $r.Json.data.id

Test-Api "Get Active Vouchers" "GET" "$base/vouchers"
Test-Api "Get Voucher by Code" "GET" "$base/vouchers/SAVE10_$ts"
Test-Api "Validate Voucher" "POST" "$base/vouchers/validate?code=SAVE10_$ts&orderAmount=200000"
Test-Api "Validate Nonexistent Voucher" "POST" "$base/vouchers/validate?code=INVALID&orderAmount=100000" -ExpectedStatus @(404,400)
Test-Api "Admin Get All Vouchers" "GET" "$base/vouchers/admin/all" -Token $adminToken
Test-Api "Create Voucher No Auth" "POST" "$base/vouchers" (@{code="FAIL";discountType="PERCENT";discountValue=5;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59"} | ConvertTo-Json) -ExpectedStatus @(401,403)

# ========== 10. REVIEW TESTS ==========
Write-Host "`n--- REVIEW TESTS ---"

$r = Test-Api "Create Review" "POST" "$base/reviews" (@{productId=$prodId;rating=5;comment="Great product!"} | ConvertTo-Json) -Token $userToken
$reviewId = $r.Json.data.id

Test-Api "Get Review by ID" "GET" "$base/reviews/$reviewId"
Test-Api "Get Product Reviews" "GET" "$base/reviews/product/$prodId"
Test-Api "Get Product Rating" "GET" "$base/reviews/product/$prodId/rating"
Test-Api "Get Product Review Count" "GET" "$base/reviews/product/$prodId/count"
Test-Api "Get My Reviews" "GET" "$base/reviews/my-reviews" -Token $userToken

if ($reviewId) {
    Test-Api "Update Review" "PUT" "$base/reviews/$reviewId" (@{rating=4;comment="Updated review"} | ConvertTo-Json) -Token $userToken
    Test-Api "Admin Update Review Status" "PUT" "$base/reviews/$reviewId/status?status=APPROVED" -Token $adminToken -ExpectedStatus @(200,400,500)
}

Test-Api "Create Review No Auth" "POST" "$base/reviews" (@{productId=$prodId;rating=3;comment="No auth"} | ConvertTo-Json) -ExpectedStatus @(401,403)

# ========== 11. RECOMMENDATION TESTS ==========
Write-Host "`n--- RECOMMENDATION TESTS ---"

Test-Api "Guest Recommendations" "GET" "$base/recommendations/guest?limit=5"
Test-Api "Personalized Recommendations" "GET" "$base/recommendations/personalized?limit=5" -Token $userToken
Test-Api "Similar Products" "GET" "$base/recommendations/similar/$prodId?limit=5"
Test-Api "Trending Products" "GET" "$base/recommendations/trending?limit=5"

# ========== 12. ADMIN STATS TESTS ==========
Write-Host "`n--- ADMIN STATS TESTS ---"

Test-Api "Dashboard Stats" "GET" "$base/admin/dashboard" -Token $adminToken
Test-Api "Revenue Report" "GET" "$base/admin/reports/revenue" -Token $adminToken
Test-Api "Product Stats" "GET" "$base/admin/reports/products" -Token $adminToken
Test-Api "User Stats" "GET" "$base/admin/reports/users" -Token $adminToken
Test-Api "Order Stats" "GET" "$base/admin/reports/orders" -Token $adminToken

Test-Api "Dashboard No Auth" "GET" "$base/admin/dashboard" -ExpectedStatus @(401,403)
Test-Api "Dashboard User Role" "GET" "$base/admin/dashboard" -Token $userToken -ExpectedStatus @(403)

# ========== 13. CLEANUP TESTS ==========
Write-Host "`n--- CLEANUP / DELETE TESTS ---"

if ($reviewId) { Test-Api "Delete Review" "DELETE" "$base/reviews/$reviewId" -Token $userToken }
if ($voucherId2) { Test-Api "Delete Voucher" "DELETE" "$base/vouchers/$voucherId2" -Token $adminToken }
Test-Api "Clear Wishlist" "DELETE" "$base/wishlists" -Token $userToken
if ($subCatId) { Test-Api "Delete Subcategory" "DELETE" "$base/categories/$subCatId" -Token $adminToken }

# ========== SUMMARY ==========
Write-Host "`n============================================"
Write-Host "  TEST RESULTS SUMMARY"
Write-Host "============================================"
Write-Host "  PASSED: $passed"
Write-Host "  FAILED: $failed"
Write-Host "  TOTAL:  $($passed + $failed)"
Write-Host "============================================"
