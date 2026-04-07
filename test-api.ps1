$ErrorActionPreference = "Continue"
$BASE = "http://localhost:8080"
. (Join-Path $PSScriptRoot "config-helper.ps1")

function Test-API {
    param([string]$Label, [string]$Method, [string]$Uri, [string]$Body = $null, [hashtable]$Headers = @{})
    try {
        $params = @{ Uri = "$BASE$Uri"; Method = $Method; Headers = $Headers; TimeoutSec = 10 }
        if ($Body) { $params["Body"] = $Body; $params["ContentType"] = "application/json" }
        $r = Invoke-RestMethod @params
        Write-Output "$Label : SUCCESS - $($r.message)"
        return $r
    } catch {
        $msg = $_.ErrorDetails.Message
        if (-not $msg) { $msg = $_.Exception.Message }
        Write-Output "$Label : FAIL - $msg"
        return $null
    }
}

# ========== AUTH TESTS ==========
Write-Output "========== AUTH TESTS =========="

# Register
$r = Test-API "01. Register" "POST" "/api/auth/register" '{"email":"apitest@test.com","password":"Test@1234","fullName":"API Test","phone":"0911111111"}'

# Login
$r = Test-API "02. Login" "POST" "/api/auth/login" '{"email":"apitest@test.com","password":"Test@1234"}'
$TOKEN = $r.data.accessToken
$REFRESH = $r.data.refreshToken
$h = @{ Authorization = "Bearer $TOKEN" }

# Duplicate Register
Test-API "03. Dup Register" "POST" "/api/auth/register" '{"email":"apitest@test.com","password":"Test@1234","fullName":"API Test","phone":"0911111111"}'

# Bad Login
Test-API "04. Bad Login" "POST" "/api/auth/login" '{"email":"apitest@test.com","password":"WrongPass"}'

# Google Login
$r = Test-API "05. Google Login" "POST" "/api/auth/google" '{"googleId":"g123","email":"gtest@gmail.com","fullName":"GTest"}'

# Google Login Again (existing user)
$r = Test-API "06. Google Login Again" "POST" "/api/auth/google" '{"googleId":"g123","email":"gtest@gmail.com","fullName":"GTest"}'

# Refresh Token
Test-API "07. Refresh Token" "POST" "/api/auth/refresh" "{`"refreshToken`":`"$REFRESH`"}" $h

# Forgot Password
Test-API "08. Forgot Password" "POST" "/api/auth/forgot-password" '{"email":"apitest@test.com"}' $h

# ========== USER TESTS ==========
Write-Output "`n========== USER TESTS =========="
Test-API "09. Get Profile" "GET" "/api/users/profile" $null $h
Test-API "10. Update Profile" "PUT" "/api/users/profile" '{"fullName":"Updated Name","phone":"0922222222","address":"456 New St"}' $h
Test-API "11. Unauth Access" "GET" "/api/users/profile"

# ========== CATEGORY TESTS (PUBLIC) ==========
Write-Output "`n========== CATEGORY TESTS =========="
Test-API "12. Get Categories" "GET" "/api/categories"
Test-API "13. Get Cat by ID" "GET" "/api/categories/1"
Test-API "14. Get Cat 404" "GET" "/api/categories/999"

# ========== PRODUCT TESTS (PUBLIC) ==========
Write-Output "`n========== PRODUCT TESTS =========="
Test-API "15. Get Products" "GET" "/api/products"
Test-API "16. Get Product ID" "GET" "/api/products/1"
Test-API "17. Get Product 404" "GET" "/api/products/999"
Test-API "18. Search Products" "GET" "/api/products/search?q=shirt"
Test-API "19. Featured Prods" "GET" "/api/products/featured"
Test-API "20. Get Slug" "GET" "/api/products/slug/classic-tshirt"

# ========== CART TESTS ==========
Write-Output "`n========== CART TESTS =========="
Test-API "21. Add to Cart" "POST" "/api/carts/add" '{"productId":1,"quantity":2}' $h
Test-API "22. Add to Cart 2" "POST" "/api/carts/add" '{"productId":3,"quantity":1}' $h
$cart = Test-API "23. Get Cart" "GET" "/api/carts" $null $h
if ($cart -and $cart.data.items) { Write-Output "    Cart Items: $($cart.data.items.Count)" }
Test-API "24. Update Qty" "PUT" "/api/carts/update" '{"productId":1,"quantity":5}' $h
Test-API "25. Unauth Cart" "GET" "/api/carts"

# ========== ORDER TESTS ==========
Write-Output "`n========== ORDER TESTS =========="
$order = Test-API "26. Create Order" "POST" "/api/orders/checkout" '{"shippingAddress":"123 Ship St","phone":"0933333333","paymentMethod":"VNPAY","notes":"Test order"}' $h
if ($order) { 
    $orderId = $order.data.id
    $orderCode = $order.data.orderCode
    Write-Output "    Order ID: $orderId, Code: $orderCode"
}
Test-API "27. Get My Orders" "GET" "/api/orders/my-orders" $null $h
if ($orderId) { Test-API "28. Get Order ID" "GET" "/api/orders/$orderId" $null $h }
if ($orderCode) { Test-API "29. Get Order Code" "GET" "/api/orders/code/$orderCode" $null $h }

# ========== VNPAY PAYMENT TESTS ==========
Write-Output "`n========== VNPAY PAYMENT TESTS =========="
if ($orderId) {
    $pay = Test-API "30. Create VNPay" "POST" "/api/payments/vnpay/create?orderId=$orderId" $null $h
    if ($pay -and $pay.data) { Write-Output "    Payment URL: $($pay.data.paymentUrl.Substring(0, [Math]::Min(80, $pay.data.paymentUrl.Length)))..." }
    Test-API "31. Get Payment" "GET" "/api/payments/order/$orderId" $null $h
}

# Test VNPay return (simulated)
Test-API "32. VNPay Return" "GET" "/api/payments/vnpay/return?vnp_TxnRef=test&vnp_ResponseCode=00&vnp_Amount=50000000"

# ========== VOUCHER TESTS ==========
Write-Output "`n========== VOUCHER TESTS =========="
Test-API "33. Get Vouchers" "GET" "/api/vouchers"
Test-API "34. Get Voucher 404" "GET" "/api/vouchers/INVALID"

# ========== WISHLIST TESTS ==========
Write-Output "`n========== WISHLIST TESTS =========="
Test-API "35. Add Wishlist" "POST" "/api/wishlists/1" $null $h
Test-API "36. Get Wishlist" "GET" "/api/wishlists" $null $h
Test-API "37. Check Wishlist" "GET" "/api/wishlists/check/1" $null $h
Test-API "38. Wishlist Count" "GET" "/api/wishlists/count" $null $h

# ========== REVIEW TESTS ==========
Write-Output "`n========== REVIEW TESTS =========="
Test-API "39. Create Review" "POST" "/api/reviews" '{"productId":1,"rating":5,"comment":"Great product!"}' $h
Test-API "40. Product Reviews" "GET" "/api/reviews/product/1"
Test-API "41. My Reviews" "GET" "/api/reviews/my-reviews" $null $h
Test-API "42. Product Rating" "GET" "/api/reviews/product/1/rating"

# ========== RECOMMENDATION TESTS ==========
Write-Output "`n========== RECOMMENDATION TESTS =========="
Test-API "43. Personalized" "GET" "/api/recommendations/personalized" $null $h
Test-API "44. Guest Recs" "GET" "/api/recommendations/guest"
Test-API "45. Similar" "GET" "/api/recommendations/similar/1"
Test-API "46. Trending" "GET" "/api/recommendations/trending"

# ========== ADMIN TESTS ==========
Write-Output "`n========== ADMIN TESTS ==========" 
# Promote user to admin
Invoke-ConfiguredMySql "UPDATE users SET role='ADMIN' WHERE email='apitest@test.com';"
$r = Test-API "Admin Login" "POST" "/api/auth/login" '{"email":"apitest@test.com","password":"Test@1234"}'
$adminToken = $r.data.accessToken
$ah = @{ Authorization = "Bearer $adminToken" }

Test-API "47. Dashboard" "GET" "/api/admin/dashboard" $null $ah
Test-API "48. Revenue Report" "GET" "/api/admin/reports/revenue" $null $ah
Test-API "49. Product Stats" "GET" "/api/admin/reports/products" $null $ah
Test-API "50. User Stats" "GET" "/api/admin/reports/users" $null $ah
Test-API "51. Order Stats" "GET" "/api/admin/reports/orders" $null $ah
Test-API "52. All Users" "GET" "/api/users" $null $ah

# Non-admin trying admin endpoint
$userLogin = Test-API "User Login" "POST" "/api/auth/login" '{"email":"gtest@gmail.com","password":"dummy"}'
Test-API "53. Non-admin Dash" "GET" "/api/admin/dashboard" $null @{ Authorization = "Bearer invalid-token" }

# ========== CLEANUP TESTS ==========
Write-Output "`n========== CLEANUP TESTS =========="
Test-API "54. Remove Wishlist" "DELETE" "/api/wishlists/1" $null $h
Test-API "55. Clear Cart" "DELETE" "/api/carts/clear" $null $h

Write-Output "`n========== ALL TESTS COMPLETE =========="
