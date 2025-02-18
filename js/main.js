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

fetch('data/nov_occupancy_simplified2.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Loaded nov_occupancy_simplified2.geojson:", data); // Debugging log

        var streetLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: "purple",
                    weight: 4,
                    opacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                let props = feature.properties;
                let popupContent = `
                    <b>Street Name:</b> ${props.STREETNAME} ${props.STYPE} <br>
                    <b>Street ID:</b> ${props["street.ID"]} <br>
                    <b>Total Occupied in Nov:</b> ${props.total_occupied}
                `;
                layer.bindPopup(popupContent);

                // Highlight effect on hover
                layer.on({
                    mouseover: function (e) {
                        var layer = e.target;
                        layer.setStyle({
                            color: "yellow",
                            weight: 5
                        });
                    },
                    mouseout: function (e) {
                        streetLayer.resetStyle(e.target);
                    }
                });
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading nov_occupancy_simplified2.geojson:', error));