function initializeMap(mapElement, eventBus) {
  // Initialize the map
  var map = L.map(mapElement, {
    center: [31.7581, -106.4874],
    zoom: 17,
    layers: [] // We'll add layers below
  });

  // Define base layers
  var lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors & CartoDB'
  }).addTo(map); // Default base map

  var darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors & CartoDB'
  });

  // Base maps object for layer control
  var baseMaps = {
    'Light Mode': lightMap,
    'Dark Mode': darkMap
  };

  // Add layer control to the map
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

  return(map);
}

export { initializeMap };
