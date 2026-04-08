// ===== Admin Reviews =====

const AdminReviewsPage = {
  _page: 0,

  async render(container) {
    container.innerHTML = renderLoading();
    await this._load(container);
  },

  async _load(container) {
    try {
      const data = await Api.adminGetReviews({ page: this._page, size: Config.ADMIN_ITEMS_PER_PAGE || 10 });
      const reviews = data.content || data || [];
      const totalPages = data.totalPages || 1;

      container.innerHTML = `
        <h1 style="margin-bottom:24px">Quản lý đánh giá</h1>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead><tr><th>Sản phẩm</th><th>Người đánh giá</th><th>Đánh giá</th><th>Nội dung</th><th>Ngày</th><th>Thao tác</th></tr></thead>
            <tbody>
              ${reviews.length === 0 ? '<tr><td colspan="6" class="text-center text-muted">Không có đánh giá</td></tr>' :
                reviews.map(r => `
                  <tr>
                    <td><strong>${sanitizeHTML(r.productName || '')}</strong></td>
                    <td>${sanitizeHTML(r.userFullName || r.userEmail || '')}</td>
                    <td>${generateStars(r.rating)}</td>
                    <td class="text-sm">${sanitizeHTML(truncate(r.comment || '', 80))}</td>
                    <td>${formatDate(r.createdAt)}</td>
                    <td class="admin-actions">
                      <button class="btn-action btn-delete" onclick="AdminReviewsPage.delete(${r.id})" title="Xóa"><i class="fas fa-trash"></i></button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
        <div id="admin-reviews-pagination"></div>
      `;
      if (totalPages > 1) {
        document.getElementById('admin-reviews-pagination').innerHTML = renderPagination(this._page + 1, totalPages, (pg) => {
          this._page = pg - 1;
          this._load(container);
        });
      }
    } catch (err) {
      container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>Có gì đó sai sai...</h3><p>${sanitizeHTML(err.message)}</p></div>`;
    }
  },

  async delete(id) {
    Modal.confirm('Xóa đánh giá', 'Bạn có chắc muốn xóa đánh giá này?', async () => {
      try {
        await Api.adminDeleteReview(id);
        Toast.success('Đã xóa');
        this._load(document.querySelector('.admin-content') || document.getElementById('main-content'));
      } catch (err) {
        Toast.error(err.message);
      }
    });
  }
};
