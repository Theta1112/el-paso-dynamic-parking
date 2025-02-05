// Initialize the map
var map = L.map('map').setView([31.7581, -106.4874], 17); // Centered around the bounding box

// Add a tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load GeoJSON file
fetch('data/parking_meters.geojson')
    .then(response => response.json())
    .then(data => {
        var geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: "blue",
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    let popupContent = `
                        <b>Location ID:</b> ${feature.properties.LocationID} <br>
                        <b>Street:</b> ${feature.properties.Street} <br>
                        <b>Total Revenue:</b> $${feature.properties.TotRev}
                    `;
                    layer.bindPopup(popupContent);

                    // Highlight effect on hover
                    layer.on({
                        mouseover: function (e) {
                            var layer = e.target;
                            layer.setStyle({
                                fillColor: "yellow",
                                color: "red",
                                weight: 2
                            });
                        },
                        mouseout: function (e) {
                            geojsonLayer.resetStyle(e.target);
                        }
                    });
                }
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
