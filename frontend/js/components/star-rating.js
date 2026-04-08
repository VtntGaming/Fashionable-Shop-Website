// ===== Star Rating Component =====

function renderStarRating(rating, size = '') {
  return `<div class="star-rating ${size}">${generateStars(rating)}</div>`;
}

function renderStarInput(currentRating = 0, onChange) {
  const id = 'star-input-' + Date.now();
  setTimeout(() => {
    const container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.value);
        if (onChange) onChange(val);
        // Update visual
        container.querySelectorAll('.star-btn').forEach((b, i) => {
          b.querySelector('i').className = i < val ? 'fas fa-star' : 'far fa-star';
        });
      });
    });
  }, 0);

  let html = `<div class="star-rating" id="${id}" style="cursor:pointer;font-size:1.25rem">`;
  for (let i = 1; i <= 5; i++) {
    html += `<button type="button" class="star-btn" data-value="${i}" style="background:none;border:none;cursor:pointer;padding:2px;color:#FDCB6E">
      <i class="${i <= currentRating ? 'fas' : 'far'} fa-star"></i>
    </button>`;
  }
  html += '</div>';
  return html;
}
