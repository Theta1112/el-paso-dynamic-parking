export function initializeToggleMode(map, lightTile, darkTile, eventBus) {
    const toggle = document.getElementById('toggle-overlay');
    const predictModeLabel = document.querySelector('.predict-mode')
  
    toggle.addEventListener('change', function () {
      const isDark = toggle.checked;
      document.body.classList.toggle('dark-mode', isDark);
  
      if (isDark) {
        map.removeLayer(lightTile);
        map.addLayer(darkTile);

        predictModeLabel.innerHTML = "Predict Mode (Active)"

      } else {
        map.removeLayer(darkTile);
        map.addLayer(lightTile);

        predictModeLabel.innerHTML = "Predict Mode (Inactive)"
      }

      const modeChange = new CustomEvent('mode-change', { detail: {isDark: isDark}});

      console.log("EVENT: MODE CHANGE");

      eventBus.dispatchEvent(modeChange);
    });
  }
  