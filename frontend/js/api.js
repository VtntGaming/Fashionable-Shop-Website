// ===== API Layer =====

const Api = {
  _getHeaders(isMultipart = false) {
    const headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = Store.getAccessToken();
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
  },

  async _request(method, url, body, isMultipart = false) {
    const fullUrl = Config.API_BASE_URL + url;
    const opts = {
      method,
      headers: this._getHeaders(isMultipart),
    };
    if (body) {
      opts.body = isMultipart ? body : JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(fullUrl, opts);
    } catch (err) {
      throw new Error('Không thể kết nối đến server');
    }

    // Handle 401 - try refresh
    if (response.status === 401 && Store.getRefreshToken()) {
      const refreshed = await this._refreshToken();
      if (refreshed) {
        opts.headers = this._getHeaders(isMultipart);
        response = await fetch(fullUrl, opts);
      } else {
        Auth.logout();
        throw new Error('Phiên đăng nhập hết hạn');
      }
    }

    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const msg = data?.message || `Lỗi ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    // Unwrap ApiResponse<T>
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data;
    }
    return data;
  },

  async _refreshToken() {
    try {
      const res = await fetch(Config.API_BASE_URL + '/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: Store.getRefreshToken() }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const result = data?.data || data;
      if (result?.accessToken) {
        Store.setTokens(result.accessToken, result.refreshToken || Store.getRefreshToken());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  get(url) { return this._request('GET', url); },
  post(url, body) { return this._request('POST', url, body); },
  put(url, body) { return this._request('PUT', url, body); },
  del(url) { return this._request('DELETE', url); },
  upload(url, formData) { return this._request('POST', url, formData, true); },

  // === Auth ===
  login(email, password) { return this.post('/auth/login', { email, password }); },
  register(data) { return this.post('/auth/register', data); },
  forgotPassword(email) { return this.post('/auth/forgot-password', { email }); },
  resetPassword(data) { return this.post('/auth/reset-password', data); },

  // === Products ===
  getProducts(params = {}) { return this.get('/products' + buildQueryString(params)); },
  getProduct(id) { return this.get('/products/' + id); },
  getProductBySlug(slug) { return this.get('/products/slug/' + slug); },
  searchProducts(q, page, size) { return this.get('/products/search' + buildQueryString({ q, page, size })); },
  getFeaturedProducts(page, size) { return this.get('/products/featured' + buildQueryString({ page, size })); },

  // === Categories ===
  getCategories() { return this.get('/categories'); },
  getCategory(id) { return this.get('/categories/' + id); },
  getCategoryBySlug(slug) { return this.get('/categories/slug/' + slug); },

  // === Cart ===
  getCart() { return this.get('/carts'); },
  addToCart(productId, quantity) { return this.post('/carts/add', { productId, quantity }); },
  updateCartItem(cartItemId, quantity) { return this.put('/carts/update', { cartItemId, quantity }); },
  removeCartItem(cartItemId) { return this.del('/carts/remove/' + cartItemId); },
  clearCart() { return this.del('/carts/clear'); },

  // === Orders ===
  createOrder(data) { return this.post('/orders', data); },
  getOrder(id) { return this.get('/orders/' + id); },
  getOrderByCode(code) { return this.get('/orders/code/' + code); },
  getMyOrders(params = {}) { return this.get('/orders/my-orders' + buildQueryString(params)); },
  cancelOrder(id) { return this.put('/orders/' + id + '/cancel'); },

  // === Payments ===
  createVnPayPayment(orderId, returnUrl) { return this.post('/payments/vnpay/create?orderId=' + orderId + '&returnUrl=' + encodeURIComponent(returnUrl || '')); },
  getPaymentStatus(orderId) { return this.get('/payments/order/' + orderId); },
  vnpayReturn(params) { return this.get('/payments/vnpay/return' + buildQueryString(params)); },

  // === Reviews ===
  getProductReviews(productId, params = {}) { return this.get('/reviews/product/' + productId + buildQueryString(params)); },
  createReview(data) { return this.post('/reviews', data); },
  updateReview(id, data) { return this.put('/reviews/' + id, data); },
  deleteReview(id) { return this.del('/reviews/' + id); },
  getMyReviews() { return this.get('/reviews/my-reviews'); },

  // === Wishlist ===
  getWishlist() { return this.get('/wishlists'); },
  checkWishlist(productId) { return this.get('/wishlists/check/' + productId); },
  addToWishlist(productId) { return this.post('/wishlists/' + productId); },
  removeFromWishlist(productId) { return this.del('/wishlists/' + productId); },
  getWishlistCount() { return this.get('/wishlists/count'); },

  // === Vouchers ===
  getVouchers(params = {}) { return this.get('/vouchers' + buildQueryString(params)); },
  getVoucherByCode(code) { return this.get('/vouchers/' + encodeURIComponent(code)); },
  validateVoucher(code, orderAmount) { return this.post('/vouchers/validate?code=' + encodeURIComponent(code) + '&orderAmount=' + orderAmount); },

  // === User ===
  getProfile() { return this.get('/users/profile'); },
  updateProfile(data) { return this.put('/users/profile', data); },
  changePassword(data) { return this.put('/users/change-password', data); },

  // === Recommendations ===
  getPersonalized() { return this.get('/recommendations/personalized'); },
  getGuestRecommendations() { return this.get('/recommendations/guest'); },
  getSimilarProducts(productId) { return this.get('/recommendations/similar/' + productId); },
  getTrending() { return this.get('/recommendations/trending'); },

  // === File Upload ===
  uploadAvatar(file) {
    const fd = new FormData();
    fd.append('file', file);
    return this.upload('/files/avatars', fd);
  },

  // === Admin ===
  adminGetDashboard() { return this.get('/admin/dashboard'); },
  adminGetProducts(params = {}) { return this.get('/products' + buildQueryString(params)); },
  adminCreateProduct(data) { return this.post('/products', data); },
  adminUpdateProduct(id, data) { return this.put('/products/' + id, data); },
  adminDeleteProduct(id) { return this.del('/products/' + id); },
  adminCreateCategory(data) { return this.post('/categories', data); },
  adminUpdateCategory(id, data) { return this.put('/categories/' + id, data); },
  adminDeleteCategory(id) { return this.del('/categories/' + id); },
  adminGetOrders(params = {}) { return this.get('/orders/my-orders' + buildQueryString(params)); },
  adminUpdateOrderStatus(id, status) { return this.put('/orders/' + id + '/status?status=' + status); },
  adminGetUsers(params = {}) { return this.get('/users' + buildQueryString(params)); },
  adminUpdateUserStatus(id, status) { return this.put('/users/' + id + '/status?status=' + status); },
  adminDeleteUser(id) { return this.del('/users/' + id); },
  adminGetAllVouchers(params = {}) { return this.get('/vouchers/admin/all' + buildQueryString(params)); },
  adminCreateVoucher(data) { return this.post('/vouchers', data); },
  adminUpdateVoucher(id, data) { return this.put('/vouchers/' + id, data); },
  adminDeleteVoucher(id) { return this.del('/vouchers/' + id); },
  adminGetReviews(params = {}) { return this.get('/reviews' + buildQueryString(params)); },
  adminUpdateReviewStatus(id, status) { return this.put('/reviews/' + id + '/status?status=' + status); },
  adminDeleteReview(id) { return this.del('/reviews/' + id); },
  adminGetVouchers(params = {}) { return this.get('/vouchers/admin/all' + buildQueryString(params)); },
  uploadProductImage(productId, file) {
    const fd = new FormData();
    fd.append('file', file);
    return this.upload('/files/products/images', fd);
  },
};
