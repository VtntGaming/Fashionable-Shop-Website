// ===== Reset Password Page =====

const ResetPasswordPage = {
  render(container, params) {
    const token = params.token || parseQueryString(window.location.hash.split('?')[1] || '').token || '';
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-illustration">
          <div class="auth-illustration-content">
            <i class="fas fa-key" style="font-size:4rem;margin-bottom:24px"></i>
            <h2>Đặt lại mật khẩu</h2>
            <p>Tạo mật khẩu mới cho tài khoản của bạn</p>
          </div>
        </div>
        <div class="auth-form-section">
          <div class="auth-form-wrapper">
            <div class="auth-logo"><a href="#/" data-link>Fashionable<span>.</span></a></div>
            <h1>Đặt lại mật khẩu</h1>
            <p class="text-muted" style="margin-bottom:24px">Nhập mật khẩu mới cho tài khoản</p>

            <form id="reset-form" onsubmit="ResetPasswordPage.handleSubmit(event)">
              <input type="hidden" name="token" value="${sanitizeHTML(token)}" />
              <div class="form-group">
                <label>Mật khẩu mới</label>
                <input type="password" name="password" class="form-control" placeholder="Tối thiểu 6 ký tự" required minlength="6" />
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu</label>
                <input type="password" name="confirmPassword" class="form-control" placeholder="Nhập lại mật khẩu" required minlength="6" />
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" id="reset-btn">
                <i class="fas fa-check"></i> Đặt lại mật khẩu
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  async handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.password.value !== form.confirmPassword.value) {
      Toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    const btn = document.getElementById('reset-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    try {
      await Api.resetPassword({ token: form.token.value, newPassword: form.password.value });
      Toast.success('Đặt lại mật khẩu thành công!');
      Router.navigate('/login');
    } catch (err) {
      Toast.error(err.message || 'Đặt lại mật khẩu thất bại');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check"></i> Đặt lại mật khẩu';
    }
  }
};
