// ===== Toast Notification =====

const Toast = {
  show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info}"></i>
      <span>${sanitizeHTML(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); },
  warning(msg) { this.show(msg, 'warning'); },
  info(msg) { this.show(msg, 'info'); },
};
