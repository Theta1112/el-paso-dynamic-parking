export function initializeToggleMode(map, lightTile, darkTile) {
    const toggle = document.getElementById('toggle-overlay');
  
    toggle.addEventListener('change', function () {
      const isDark = toggle.checked;
      document.body.classList.toggle('dark-mode', isDark);
  
      if (isDark) {
        map.removeLayer(lightTile);
        map.addLayer(darkTile);
      } else {
        map.removeLayer(darkTile);
        map.addLayer(lightTile);
      }
    });
  }
  