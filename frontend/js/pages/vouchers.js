// ===== Vouchers Page =====

const VouchersPage = {
  async render(container) {
    container.innerHTML = `<div class="container">${renderLoading()}</div>`;
    try {
      const voucherData = await Api.getVouchers();
      const vouchers = Array.isArray(voucherData) ? voucherData : (voucherData?.content || voucherData?.items || []);
      container.innerHTML = `
        <div class="container">
          <div class="page-header">
            <div class="breadcrumbs"><a href="#/" data-link>Trang chủ</a><i class="fas fa-chevron-right text-xs"></i><span>Mã giảm giá</span></div>
            <h1><i class="fas fa-ticket-alt" style="color:var(--accent)"></i> Mã giảm giá</h1>
          </div>
          ${vouchers.length === 0 ? `
            <div class="empty-state">
              <i class="fas fa-ticket-alt"></i>
              <h3>Chưa có mã giảm giá</h3>
              <p>Hiện tại chưa có mã giảm giá nào khả dụng</p>
            </div>
          ` : `
            <div class="vouchers-grid">
              ${vouchers.map(v => {
                const isExpired = v.endDate ? new Date(v.endDate) < new Date() : false;
                const isOutOfStock = typeof v.quantity === 'number' ? v.quantity <= 0 : false;
                const disabled = isExpired || isOutOfStock || v.status !== 'ACTIVE' || v.isValid === false;
                return `
                  <div class="voucher-card ${disabled ? 'voucher-disabled' : ''}">
                    <div class="voucher-left">
                      <div class="voucher-icon"><i class="fas fa-percent"></i></div>
                      <span class="voucher-discount">${v.discountType === 'PERCENT' ? v.discountValue + '%' : formatCurrency(v.discountValue)}</span>
                    </div>
                    <div class="voucher-right">
                      <h3>${sanitizeHTML(v.code)}</h3>
                      <p class="text-sm text-muted">Giảm tối đa ${formatCurrency(v.maxDiscount || 0)}</p>
                      <div class="voucher-meta">
                        ${v.minOrderValue ? `<span class="text-xs">Đơn tối thiểu: ${formatCurrency(v.minOrderValue)}</span>` : ''}
                        <span class="text-xs">HSD: ${formatDate(v.endDate)}</span>
                        <span class="text-xs">SL: ${v.quantity ?? 0}</span>
                      </div>
                      ${disabled ? `<span class="badge badge-danger text-xs">${isExpired ? 'Hết hạn' : 'Không khả dụng'}</span>` :
                        `<button class="btn btn-accent btn-sm" onclick="VouchersPage.copy('${sanitizeHTML(v.code)}')"><i class="fas fa-copy"></i> Sao chép</button>`}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="container"><div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div></div>`;
    }
  },

  copy(code) {
    navigator.clipboard.writeText(code).then(() => {
      Toast.success(`Đã sao chép mã: ${code}`);
    }).catch(() => {
      Toast.info(`Mã giảm giá: ${code}`);
    });
  }
};
