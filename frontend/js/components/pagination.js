// ===== Pagination Component =====

function renderPagination(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return '';

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible);
  if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

  for (let i = start; i < end; i++) pages.push(i);

  const id = 'pagination-' + Date.now();
  setTimeout(() => {
    const container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (!isNaN(page)) onPageChange(page);
      });
    });
  }, 0);

  return `
    <div class="pagination" id="${id}">
      <button data-page="${currentPage - 1}" ${currentPage === 0 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
      ${pages.map(p => `
        <button data-page="${p}" class="${p === currentPage ? 'active' : ''}">${p + 1}</button>
      `).join('')}
      <button data-page="${currentPage + 1}" ${currentPage >= totalPages - 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  `;
}
