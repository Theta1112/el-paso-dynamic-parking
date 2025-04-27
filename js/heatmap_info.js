export function initializeHeatmapInfo() {
    const icon = document.querySelector('.heatmap-info-icon');
    const modal = document.getElementById('heatmap-modal');
    const closeBtn = modal.querySelector('.close-button');
  
    if (!icon || !modal || !closeBtn) {
      console.warn('Heatmap modal elements not found.');
      return;
    }
  
    icon.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
  