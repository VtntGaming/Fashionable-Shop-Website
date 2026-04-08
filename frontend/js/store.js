// ===== Store - Simple State Management =====

const Store = {
  _listeners: [],

  // === Auth State ===
  getUser() {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  },

  setUser(user) {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
    this._notify();
  },

  getAccessToken() {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  setTokens(access, refresh) {
    if (access) localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
  },

  clearAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this._cart = null;
    this._notify();
  },

  isAuthenticated() {
    return !!this.getAccessToken() && !!this.getUser();
  },

  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'ADMIN';
  },

  // === Cart State ===
  _cart: null,

  getCart() { return this._cart; },

  setCart(cart) {
    this._cart = cart;
    this._notify();
  },

  getCartCount() {
    if (!this._cart || !this._cart.items) return 0;
    return this._cart.items.length;
  },

  // === Listeners ===
  subscribe(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  },

  _notify() {
    this._listeners.forEach(fn => fn());
  }
};
