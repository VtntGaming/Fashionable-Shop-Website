// ===== Login Page =====

const LoginPage = {
  render(container) {
    container.innerHTML = `
      <div class="auth-page">
        <div class="auth-illustration">
          <div class="auth-illustration-content">
            <i class="fas fa-shopping-bag" style="font-size:4rem;margin-bottom:24px"></i>
            <h2>Chào mừng trở lại!</h2>
            <p>Đăng nhập để mua sắm và theo dõi đơn hàng của bạn</p>
          </div>
        </div>
        <div class="auth-form-section">
          <div class="auth-form-wrapper">
            <div class="auth-logo"><a href="#/" data-link>Fashionable<span>.</span></a></div>
            <h1>Đăng nhập</h1>
            <p class="text-muted" style="margin-bottom:24px">Nhập thông tin tài khoản của bạn</p>

            <form id="login-form" onsubmit="LoginPage.handleSubmit(event)">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" class="form-control" placeholder="your@email.com" required autofocus />
              </div>
              <div class="form-group">
                <label for="password">Mật khẩu</label>
                <div style="position:relative">
                  <input type="password" id="password" name="password" class="form-control" placeholder="••••••" required minlength="6" />
                  <button type="button" class="password-toggle" onclick="LoginPage.togglePassword()" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted)">
                    <i class="fas fa-eye" id="pw-icon"></i>
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between" style="margin-bottom:16px">
                <label class="text-sm" style="display:flex;align-items:center;gap:6px">
                  <input type="checkbox" name="remember" /> Ghi nhớ
                </label>
                <a href="#/forgot-password" data-link class="text-sm" style="color:var(--primary)">Quên mật khẩu?</a>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%" id="login-btn">
                <i class="fas fa-sign-in-alt"></i> Đăng nhập
              </button>
            </form>

            <div class="auth-divider" style="display:flex;align-items:center;gap:16px;margin:24px 0;color:var(--text-muted)">
              <hr style="flex:1;border-color:var(--border)" /><span class="text-sm">hoặc</span><hr style="flex:1;border-color:var(--border)" />
            </div>

            <a href="${Config.GOOGLE_OAUTH_URL}" class="btn btn-secondary" style="width:100%">
              <i class="fab fa-google"></i> Đăng nhập với Google
            </a>

            <p class="text-center" style="margin-top:24px">
              Chưa có tài khoản? <a href="#/register" data-link style="color:var(--primary);font-weight:600">Đăng ký</a>
            </p>
          </div>
        </div>
      </div>
    `;
  },

  togglePassword() {
    const pw = document.getElementById('password');
    const icon = document.getElementById('pw-icon');
    if (pw.type === 'password') {
      pw.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      pw.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
    try {
      await Auth.login(e.target.email.value.trim(), e.target.password.value);
      Toast.success('Đăng nhập thành công!');
      Router.navigate('/');
    } catch (err) {
      Toast.error(err.message || 'Đăng nhập thất bại');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng nhập';
    }
  }
};
