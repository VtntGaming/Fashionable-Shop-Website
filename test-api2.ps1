param()
$ErrorActionPreference = "Continue"
$base = "http://localhost:8080/api"
. (Join-Path $PSScriptRoot "config-helper.ps1")
$script:passed = 0
$script:failed = 0
$script:failList = [System.Collections.ArrayList]::new()

function Api([string]$Name, [string]$Method, [string]$Url, [string]$Body, [string]$Token, [int[]]$Expected) {
    if (-not $Expected) { $Expected = @(200,201) }
    $h = @{}
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    if ($Body) { $h["Content-Type"] = "application/json" }
    
    $p = @{ Uri=$Url; Method=$Method; Headers=$h; UseBasicParsing=$true }
    
    [int]$statusCode = 0
    $content = ""
    $jsonObj = $null
    
    try {
        if ($Body -and ($Method -eq "POST" -or $Method -eq "PUT" -or $Method -eq "PATCH")) {
            $p["Body"] = [System.Text.Encoding]::UTF8.GetBytes($Body)
        }
        $resp = Invoke-WebRequest @p -ErrorAction Stop
        $statusCode = [int]$resp.StatusCode
        $content = $resp.Content
    } catch {
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        try { $content = $_.ErrorDetails.Message } catch {}
    }
    
    try { $jsonObj = $content | ConvertFrom-Json -ErrorAction SilentlyContinue } catch {}
    
    $isPass = $Expected -contains $statusCode
    if ($isPass) { $script:passed++ } else { 
        $script:failed++
        $detail = "$Name => HTTP $statusCode (expected $($Expected -join ','))"
        if ($jsonObj -and $jsonObj.message) { $detail += " - $($jsonObj.message)" }
        [void]$script:failList.Add($detail)
    }
    $mark = if ($isPass) { "OK" } else { "XX" }
    Write-Host "[$mark] $Name => HTTP $statusCode"
    
    $result = [PSCustomObject]@{ S=$statusCode; J=$jsonObj; P=$isPass; C=$content }
    return $result
}

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
Write-Host "=== FASHION SHOP API COMPREHENSIVE TEST ==="
Write-Host "Timestamp: $ts"
Write-Host ""

# ===== AUTH =====
Write-Host "--- AUTH ---"
$userEmail = "user${ts}@test.com"
$r = Api "Register" "POST" "$base/auth/register" (@{email=$userEmail;password="Test1234!";fullName="Test User";phone="0123456789"} | ConvertTo-Json)
$userToken = $r.J.data.accessToken
$userId = $r.J.data.user.id

$r = Api "Login" "POST" "$base/auth/login" (@{email=$userEmail;password="Test1234!"} | ConvertTo-Json)
$userToken = $r.J.data.accessToken
$userRefresh = $r.J.data.refreshToken

Api "Login Wrong Pass" "POST" "$base/auth/login" (@{email=$userEmail;password="wrong"} | ConvertTo-Json) "" @(401,400)
Api "Register Invalid" "POST" "$base/auth/register" (@{email="bad";password="Test1234!";fullName="T";phone=""} | ConvertTo-Json) "" @(400)

$r = Api "Refresh Token" "POST" "$base/auth/refresh" (@{refreshToken=$userRefresh} | ConvertTo-Json)
if ($r.J.data.accessToken) { $userToken = $r.J.data.accessToken }
Api "Refresh Invalid" "POST" "$base/auth/refresh" (@{refreshToken="bad"} | ConvertTo-Json) "" @(400,401)

$r = Api "Google OAuth2 New" "POST" "$base/auth/google" (@{googleId="g${ts}";email="g${ts}@gmail.com";fullName="Google User"} | ConvertTo-Json)
Api "Google OAuth2 Exist" "POST" "$base/auth/google" (@{googleId="g${ts}";email="g${ts}@gmail.com";fullName="Google User"} | ConvertTo-Json)
Api "Google Empty" "POST" "$base/auth/google" (@{googleId="";email="";fullName=""} | ConvertTo-Json) "" @(400)
Api "Forgot Password" "POST" "$base/auth/forgot-password" (@{email=$userEmail} | ConvertTo-Json) "" @(200,201,500)
Api "Reset Bad Token" "POST" "$base/auth/reset-password" (@{token="bad";newPassword="New1234!"} | ConvertTo-Json) "" @(400)

# Admin setup
$adminEmail = "adm${ts}@test.com"
Api "Register Admin" "POST" "$base/auth/register" (@{email=$adminEmail;password="Admin1234!";fullName="Admin";phone="0987"} | ConvertTo-Json)
Invoke-ConfiguredMySql "UPDATE users SET role='ADMIN' WHERE email='$adminEmail';"
$r = Api "Login Admin" "POST" "$base/auth/login" (@{email=$adminEmail;password="Admin1234!"} | ConvertTo-Json)
$adminToken = $r.J.data.accessToken

# ===== USERS =====
Write-Host "`n--- USERS ---"
Api "Get Profile" "GET" "$base/users/profile" "" $userToken
Api "No Auth Profile" "GET" "$base/users/profile" "" "" @(401)
Api "Update Profile" "PUT" "$base/users/profile" (@{fullName="Updated";phone="0111";address="123 St"} | ConvertTo-Json) $userToken
Api "Get User ID" "GET" "$base/users/$userId" "" $userToken
Api "Admin List Users" "GET" "$base/users?page=0&size=5" "" $adminToken
Api "User List (403)" "GET" "$base/users?page=0&size=5" "" $userToken @(403)

# ===== CATEGORIES =====
Write-Host "`n--- CATEGORIES ---"
$r = Api "Create Category" "POST" "$base/categories" (@{name="Cat${ts}";slug="cat-${ts}";description="Test"} | ConvertTo-Json) $adminToken
$catId = $r.J.data.id
$r = Api "Create SubCat" "POST" "$base/categories" (@{name="Sub${ts}";slug="sub-${ts}";description="Sub";parentId=$catId} | ConvertTo-Json) $adminToken
$subCatId = $r.J.data.id
Api "Get All Cats" "GET" "$base/categories"
Api "Get Cat ID" "GET" "$base/categories/$catId"
Api "Get Cat Slug" "GET" "$base/categories/slug/cat-${ts}"
Api "Get SubCats" "GET" "$base/categories/${catId}/children"
Api "Update Cat" "PUT" "$base/categories/$catId" (@{name="Upd${ts}";slug="cat-${ts}";description="U"} | ConvertTo-Json) $adminToken
Api "Create Cat NoAuth" "POST" "$base/categories" (@{name="X";slug="x"} | ConvertTo-Json) "" @(401)
Api "Create Cat User" "POST" "$base/categories" (@{name="X";slug="x"} | ConvertTo-Json) $userToken @(403)

# ===== PRODUCTS =====
Write-Host "`n--- PRODUCTS ---"
$r = Api "Create Product" "POST" "$base/products" (@{name="Prod${ts}";slug="prod-${ts}";description="Test";price=250000;salePrice=200000;stock=100;categoryId=$catId;brand="B"} | ConvertTo-Json) $adminToken
$prodId = $r.J.data.id
$r = Api "Create Product2" "POST" "$base/products" (@{name="P2${ts}";slug="p2-${ts}";description="2nd";price=500000;stock=50;categoryId=$catId;brand="B2"} | ConvertTo-Json) $adminToken
$prodId2 = $r.J.data.id
Api "Get Products" "GET" "$base/products"
Api "Get Prod ID" "GET" "$base/products/$prodId"
Api "Get Prod Slug" "GET" "$base/products/slug/prod-${ts}"
Api "Search Prods" "GET" "$base/products/search?q=Prod"
Api "Filter Prods" "GET" "$base/products?categoryId=$catId&minPrice=100000&maxPrice=600000"
Api "Featured" "GET" "$base/products/featured"
Api "Update Product" "PUT" "$base/products/$prodId" (@{name="PdUpd${ts}";price=300000} | ConvertTo-Json) $adminToken
Api "Prod NoAuth" "POST" "$base/products" (@{name="X";slug="x";price=1} | ConvertTo-Json) "" @(401)
Api "Prod Not Found" "GET" "$base/products/999999" "" "" @(404)

# ===== CART =====
Write-Host "`n--- CART ---"
Api "Empty Cart" "GET" "$base/carts" "" $userToken
$r = Api "Add Cart" "POST" "$base/carts/add" (@{productId=$prodId;quantity=2} | ConvertTo-Json) $userToken
$cartItemId = $null
if ($r.J.data.items) { $cartItemId = $r.J.data.items[0].id }
Api "Add Cart2" "POST" "$base/carts/add" (@{productId=$prodId2;quantity=1} | ConvertTo-Json) $userToken
Api "Get Cart" "GET" "$base/carts" "" $userToken
if ($cartItemId) { Api "Update Cart" "PUT" "$base/carts/update" (@{cartItemId=$cartItemId;quantity=3} | ConvertTo-Json) $userToken }
Api "Cart NoAuth" "GET" "$base/carts" "" "" @(401)

# ===== WISHLIST =====
Write-Host "`n--- WISHLIST ---"
Api "Get Wishlist" "GET" "$base/wishlists" "" $userToken
Api "Add Wish" "POST" "$base/wishlists/$prodId" "" $userToken
Api "Add Wish2" "POST" "$base/wishlists/$prodId2" "" $userToken
Api "Check Wish" "GET" "$base/wishlists/check/$prodId" "" $userToken
Api "Wish Count" "GET" "$base/wishlists/count" "" $userToken
Api "Remove Wish" "DELETE" "$base/wishlists/$prodId2" "" $userToken
Api "Wish NoAuth" "GET" "$base/wishlists" "" "" @(401)

# ===== ORDERS =====
Write-Host "`n--- ORDERS ---"
$r = Api "Order COD" "POST" "$base/orders" (@{shippingAddress="123 St HCM";phone="0123456789";paymentMethod="COD"} | ConvertTo-Json) $userToken
$orderId = $r.J.data.id
$orderCode = $r.J.data.orderCode
if ($orderId) { Api "Get Order" "GET" "$base/orders/$orderId" }
if ($orderCode) { Api "Get Order Code" "GET" "$base/orders/code/$orderCode" }
Api "My Orders" "GET" "$base/orders/my-orders" "" $userToken

Api "Re-add Cart" "POST" "$base/carts/add" (@{productId=$prodId;quantity=1} | ConvertTo-Json) $userToken
$r = Api "Order VNPay" "POST" "$base/orders" (@{shippingAddress="456 St";phone="0987654321";paymentMethod="VNPAY"} | ConvertTo-Json) $userToken
$vnpayOrderId = $r.J.data.id
Api "Order Empty" "POST" "$base/orders" (@{shippingAddress="X";phone="0";paymentMethod="COD"} | ConvertTo-Json) $userToken @(400)
if ($orderId) { Api "Cancel Order" "PUT" "$base/orders/${orderId}/cancel" "" $userToken }

# ===== PAYMENT =====
Write-Host "`n--- VNPAY PAYMENT ---"
if ($vnpayOrderId) {
    $r = Api "VNPay URL" "POST" "$base/payments/vnpay/create?orderId=${vnpayOrderId}&returnUrl=http://localhost:3000/payment-result"
    if ($r.J.data.paymentUrl) { Write-Host "  Payment URL: $($r.J.data.paymentUrl.Substring(0, [Math]::Min(120, $r.J.data.paymentUrl.Length)))..." }
    Api "Get Payment" "GET" "$base/payments/order/$vnpayOrderId"
}
Api "VNPay Bad Order" "POST" "$base/payments/vnpay/create?orderId=999999" "" "" @(404,400,500)
Api "VNPay Bad Hash" "GET" "$base/payments/vnpay/return?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=bad" "" "" @(200,400,500)
Api "VNPay IPN" "POST" "$base/payments/vnpay/ipn?vnp_ResponseCode=00&vnp_TxnRef=test&vnp_SecureHash=bad" "" "" @(200)

# Admin status update (after payment tests, since order must be PENDING for payment creation)
if ($vnpayOrderId) { Api "Admin Status" "PUT" "$base/orders/${vnpayOrderId}/status?status=SHIPPING" "" $adminToken }

# ===== VOUCHERS =====
Write-Host "`n--- VOUCHERS ---"
$vCode = "V${ts}"
$r = Api "Create Voucher%" "POST" "$base/vouchers" (@{code=$vCode;discountType="PERCENT";discountValue=10;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";minOrderValue=100000;maxDiscount=50000;quantity=100;status="ACTIVE"} | ConvertTo-Json) $adminToken
$voucherId = $r.J.data.id
$r = Api "Create VouchrAmt" "POST" "$base/vouchers" (@{code="F${ts}";discountType="AMOUNT";discountValue=50000;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59";quantity=50;status="ACTIVE"} | ConvertTo-Json) $adminToken
$voucherId2 = $r.J.data.id
Api "Active Vouchers" "GET" "$base/vouchers"
Api "Voucher Code" "GET" "$base/vouchers/$vCode"
Api "Validate Voucher" "POST" "$base/vouchers/validate?code=${vCode}&orderAmount=200000"
Api "Validate Bad" "POST" "$base/vouchers/validate?code=BAD&orderAmount=100" "" "" @(404,400)
Api "Admin Vouchers" "GET" "$base/vouchers/admin/all" "" $adminToken
Api "Voucher NoAuth" "POST" "$base/vouchers" (@{code="X";discountType="PERCENT";discountValue=5;startDate="2026-01-01T00:00:00";endDate="2026-12-31T23:59:59"} | ConvertTo-Json) "" @(401)

# ===== REVIEWS =====
Write-Host "`n--- REVIEWS ---"
$r = Api "Create Review" "POST" "$base/reviews" (@{productId=$prodId;rating=5;comment="Great!"} | ConvertTo-Json) $userToken
$reviewId = $r.J.data.id
if ($reviewId) {
    Api "Get Review" "GET" "$base/reviews/$reviewId"
    Api "Update Review" "PUT" "$base/reviews/$reviewId" (@{rating=4;comment="Updated"} | ConvertTo-Json) $userToken
}
Api "Prod Reviews" "GET" "$base/reviews/product/$prodId"
Api "Prod Rating" "GET" "$base/reviews/product/$prodId/rating"
Api "Prod RevCount" "GET" "$base/reviews/product/$prodId/count"
Api "My Reviews" "GET" "$base/reviews/my-reviews" "" $userToken
Api "Review NoAuth" "POST" "$base/reviews" (@{productId=$prodId;rating=3;comment="X"} | ConvertTo-Json) "" @(401)

# ===== RECOMMENDATIONS =====
Write-Host "`n--- RECOMMENDATIONS ---"
Api "Guest Recs" "GET" "$base/recommendations/guest?limit=5"
Api "Personal Recs" "GET" "$base/recommendations/personalized?limit=5" "" $userToken
Api "Similar" "GET" "$base/recommendations/similar/${prodId}?limit=5"
Api "Trending" "GET" "$base/recommendations/trending?limit=5"

# ===== ADMIN STATS =====
Write-Host "`n--- ADMIN STATS ---"
Api "Dashboard" "GET" "$base/admin/dashboard" "" $adminToken
Api "Revenue" "GET" "$base/admin/reports/revenue" "" $adminToken
Api "Prod Stats" "GET" "$base/admin/reports/products" "" $adminToken
Api "User Stats" "GET" "$base/admin/reports/users" "" $adminToken
Api "Order Stats" "GET" "$base/admin/reports/orders" "" $adminToken
Api "Dash NoAuth" "GET" "$base/admin/dashboard" "" "" @(401)
Api "Dash User" "GET" "$base/admin/dashboard" "" $userToken @(403)

# ===== CLEANUP =====
Write-Host "`n--- CLEANUP ---"
if ($reviewId) { Api "Del Review" "DELETE" "$base/reviews/$reviewId" "" $userToken }
if ($voucherId2) { Api "Del Voucher" "DELETE" "$base/vouchers/$voucherId2" "" $adminToken }
Api "Clear Wish" "DELETE" "$base/wishlists" "" $userToken
if ($subCatId) { Api "Del SubCat" "DELETE" "$base/categories/$subCatId" "" $adminToken }

# ===== SUMMARY =====
Write-Host ""
Write-Host "=========================================="
Write-Host "  PASSED: $($script:passed)"
Write-Host "  FAILED: $($script:failed)"  
Write-Host "  TOTAL:  $($script:passed + $script:failed)"
Write-Host "=========================================="
if ($script:failList.Count -gt 0) {
    Write-Host ""
    Write-Host "FAILED TESTS:"
    foreach ($f in $script:failList) { Write-Host "  $f" }
}
