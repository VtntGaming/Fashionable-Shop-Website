// ===== Admin Vouchers =====

const AdminVouchersPage = {
  async render(container) {
    container.innerHTML = renderLoading();
    try {
      const vouchers = await Api.adminGetVouchers();
      container.innerHTML = `
        <div class="flex items-center justify-between" style="margin-bottom:24px">
          <h1>Quản lý mã giảm giá</h1>
          <button class="btn btn-primary" onclick="AdminVouchersPage.showForm()"><i class="fas fa-plus"></i> Thêm mới</button>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Mã</th><th>Giảm giá</th><th>Đơn tối thiểu</th><th>Sử dụng</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${(!vouchers || vouchers.length === 0) ? '<tr><td colspan="7" class="text-center text-muted">Không có mã giảm giá</td></tr>' :
                vouchers.map(v => {
                  const expired = new Date(v.expiryDate) < new Date();
                  return `
                    <tr>
                      <td><strong>${sanitizeHTML(v.code)}</strong></td>
                      <td>${v.discountType === 'PERCENTAGE' ? v.discountValue + '%' : formatCurrency(v.discountValue)}</td>
                      <td>${v.minOrderAmount ? formatCurrency(v.minOrderAmount) : '-'}</td>
                      <td>${v.currentUsage}/${v.maxUsage}</td>
                      <td>${formatDate(v.expiryDate)}</td>
                      <td><span class="status-badge ${expired ? 'status-inactive' : (v.active !== false ? 'status-active' : 'status-inactive')}">${expired ? 'Hết hạn' : (v.active !== false ? 'Hoạt động' : 'Ẩn')}</span></td>
                      <td class="admin-actions">
                        <button class="btn-action btn-edit" onclick="AdminVouchersPage.showForm(${v.id})" title="Sửa"><i class="fas fa-edit"></i></button>
                        <button class="btn-action btn-delete" onclick="AdminVouchersPage.delete(${v.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async showForm(id) {
    let v = { code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxUsage: '', expiryDate: '' };
    if (id) {
      try {
        const vouchers = await Api.adminGetVouchers();
        v = vouchers.find(x => x.id === id) || v;
      } catch (_) {}
    }
    const expiryVal = v.expiryDate ? new Date(v.expiryDate).toISOString().slice(0, 10) : '';
    Modal.show(
      id ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá',
      `<form id="voucher-form">
        <div class="form-group"><label>Mã giảm giá *</label><input type="text" name="code" class="form-control" value="${sanitizeHTML(v.code)}" required style="text-transform:uppercase" /></div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Loại giảm *</label>
            <select name="discountType" class="form-control">
              <option value="PERCENTAGE" ${v.discountType === 'PERCENTAGE' ? 'selected' : ''}>Phần trăm (%)</option>
              <option value="FIXED" ${v.discountType === 'FIXED' ? 'selected' : ''}>Số tiền cố định</option>
            </select>
          </div>
          <div class="form-group" style="flex:1"><label>Giá trị *</label><input type="number" name="discountValue" class="form-control" value="${v.discountValue || ''}" required min="0" /></div>
        </div>
        <div class="flex gap-3">
          <div class="form-group" style="flex:1"><label>Đơn tối thiểu</label><input type="number" name="minOrderAmount" class="form-control" value="${v.minOrderAmount || ''}" min="0" /></div>
          <div class="form-group" style="flex:1"><label>Lượt dùng tối đa *</label><input type="number" name="maxUsage" class="form-control" value="${v.maxUsage || ''}" required min="1" /></div>
        </div>
        <div class="form-group"><label>Ngày hết hạn *</label><input type="date" name="expiryDate" class="form-control" value="${expiryVal}" required /></div>
      </form>`,
      `<button class="btn btn-secondary" onclick="Modal.hide()">Hủy</button>
       <button class="btn btn-primary" onclick="AdminVouchersPage.save(${id || 'null'})">${id ? 'Cập nhật' : 'Tạo mới'}</button>`
    );
  },

  async save(id) {
    const form = document.getElementById('voucher-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    try {
      const data = {
        code: form.code.value.trim().toUpperCase(),
        discountType: form.discountType.value,
        discountValue: parseFloat(form.discountValue.value),
        minOrderAmount: form.minOrderAmount.value ? parseFloat(form.minOrderAmount.value) : null,
        maxUsage: parseInt(form.maxUsage.value),
        expiryDate: form.expiryDate.value
      };
      if (id) {
        await Api.adminUpdateVoucher(id, data);
      } else {
        await Api.adminCreateVoucher(data);
      }
      Modal.hide();
      Toast.success(id ? 'Đã cập nhật' : 'Đã tạo mã giảm giá');
      this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
    } catch (err) {
      Toast.error(err.message);
    }
  },

  async delete(id) {
    Modal.confirm('Xóa mã giảm giá', 'Bạn có chắc muốn xóa mã giảm giá này?', async () => {
      try {
        await Api.adminDeleteVoucher(id);
        Toast.success('Đã xóa');
        this.render(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
