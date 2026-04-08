// ===== App Bootstrap =====

const App = {
  init() {
    // ---- Register public routes ----
    Router.register('/', (c) => HomePage.render(c));
    Router.register('/shop', (c) => ShopPage.render(c));
    Router.register('/shop/:category', (c, p) => { ShopPage._categorySlug = p.category; ShopPage.render(c); });
    Router.register('/product/:slug', (c, p) => ProductDetailPage.render(c, p));
    Router.register('/vouchers', (c) => VouchersPage.render(c));

    // ---- Auth routes (guest only) ----
    Router.register('/login', (c) => LoginPage.render(c), { guestOnly: true });
    Router.register('/register', (c) => RegisterPage.render(c), { guestOnly: true });
    Router.register('/forgot-password', (c) => ForgotPasswordPage.render(c), { guestOnly: true });
    Router.register('/reset-password/:token', (c, p) => ResetPasswordPage.render(c, p), { guestOnly: true });
    Router.register('/reset-password', (c) => ResetPasswordPage.render(c, {}), { guestOnly: true });

    // ---- OAuth callback ----
    Router.register('/oauth/success', (c) => OAuthSuccessPage.render(c));

    // ---- Authenticated routes ----
    Router.register('/cart', (c) => CartPage.render(c), { requireAuth: true });
    Router.register('/checkout', (c) => CheckoutPage.render(c), { requireAuth: true });
    Router.register('/orders', (c) => OrdersPage.render(c), { requireAuth: true });
    Router.register('/orders/:id', (c, p) => OrderDetailPage.render(c, p), { requireAuth: true });
    Router.register('/wishlist', (c) => WishlistPage.render(c), { requireAuth: true });
    Router.register('/profile', (c) => ProfilePage.render(c), { requireAuth: true });
    Router.register('/payment/result', (c) => PaymentResultPage.render(c), { requireAuth: true });

    // ---- Admin routes ----
    Router.register('/admin', (c) => AdminDashboardPage.render(c), { requireAdmin: true });
    Router.register('/admin/dashboard', (c) => AdminDashboardPage.render(c), { requireAdmin: true });
    Router.register('/admin/products', (c) => AdminProductsPage.render(c), { requireAdmin: true });
    Router.register('/admin/categories', (c) => AdminCategoriesPage.render(c), { requireAdmin: true });
    Router.register('/admin/orders', (c) => AdminOrdersPage.render(c), { requireAdmin: true });
    Router.register('/admin/customers', (c) => AdminCustomersPage.render(c), { requireAdmin: true });
    Router.register('/admin/vouchers', (c) => AdminVouchersPage.render(c), { requireAdmin: true });
    Router.register('/admin/reviews', (c) => AdminReviewsPage.render(c), { requireAdmin: true });

    // ---- Subscribe to store changes ----
    Store.subscribe(() => {
      Header.render(document.getElementById('header'));
    });

    // ---- Render layout ----
    Header.render(document.getElementById('header'));
    Footer.render(document.getElementById('footer'));

    // ---- Load cart if authenticated ----
    if (Store.isAuthenticated()) {
      Api.getCart().then(cart => {
        Store.setCart(cart);
      }).catch(() => {});
    }

    // ---- Start router ----
    Router.init();
  }
};

// ---- Start app when DOM is ready ----
document.addEventListener('DOMContentLoaded', () => App.init());
