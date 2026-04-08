// ===== Auth Module =====

const Auth = {
  async login(email, password) {
    const result = await Api.login(email, password);
    Store.setTokens(result.accessToken, result.refreshToken);
    Store.setUser(result.user);
    return result.user;
  },

  async register(data) {
    const result = await Api.register(data);
    Store.setTokens(result.accessToken, result.refreshToken);
    Store.setUser(result.user);
    return result.user;
  },

  logout() {
    Store.clearAuth();
    Router.navigate('/login');
  },

  async refreshProfile() {
    try {
      const user = await Api.getProfile();
      Store.setUser(user);
      return user;
    } catch {
      return null;
    }
  },
};
