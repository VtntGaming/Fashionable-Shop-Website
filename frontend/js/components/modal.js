// ===== Modal Component =====

const Modal = {
  show(title, bodyHtml, footerHtml = '') {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${sanitizeHTML(title)}</h3>
          <button class="modal-close" onclick="Modal.hide()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Modal.hide();
    });
  },

  hide() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
    overlay.innerHTML = '';
  },

  confirm(title, message, onConfirm) {
    this.show(title, `<p>${sanitizeHTML(message)}</p>`, `
      <button class="btn btn-secondary btn-sm" onclick="Modal.hide()">Hủy</button>
      <button class="btn btn-danger btn-sm" id="modal-confirm-btn">Xác nhận</button>
    `);
    setTimeout(() => {
      const btn = document.getElementById('modal-confirm-btn');
      if (btn) btn.addEventListener('click', () => { Modal.hide(); onConfirm(); });
    }, 0);
  }
};
