// ===== OAuth Success Page =====

const OAuthSuccessPage = {
  async render(container) {
    container.innerHTML = `<div class="container" style="padding:60px 0;text-align:center">${renderLoading()}<p class="text-muted" style="margin-top:16px">Đang xử lý đăng nhập...</p></div>`;

    const qs = parseQueryString(window.location.hash.split('?')[1] || '');
    const token = qs.token || qs.accessToken;
    const refreshToken = qs.refreshToken;

    if (token) {
      Store.setTokens(token, refreshToken || '');
      try {
        const user = await Api.getProfile();
        Store.setUser(user);
        Toast.success('Đăng nhập thành công!');
        Router.navigate('/');
      } catch (err) {
        Store.clearAuth();
        Toast.error('Đăng nhập thất bại');
        Router.navigate('/login');
      }
    } else {
      Toast.error('Đăng nhập thất bại');
      Router.navigate('/login');
    }
  }
};
