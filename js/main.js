// script.js

// Initialize the map
var map = L.map('map', {
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
    "Light Mode": lightMap,
    "Dark Mode": darkMap
};

// Add layer control to the map
L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

// Helper function to check if an object is empty
function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Load GeoJSON file: parking_meters.geojson
fetch('data/parking_meters.geojson')
    .then(response => response.json())
    .then(data => {
        if (!data || isEmpty(data)) {
            console.error('Empty or invalid GeoJSON for parking_meters.geojson');
            return;
        }

        var geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 2,
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
                        <b>Location ID:</b> ${feature.properties.LocationID ?? 'N/A'} <br>
                        <b>Street:</b> ${feature.properties.Street ?? 'N/A'} <br>
                        <b>Total Revenue:</b> $${feature.properties.TotRev ?? 'N/A'}
                    `;
                    layer.bindPopup(popupContent);

                    // Highlight effect on hover
                    layer.on({
                        mouseover: function (e) {
                            var targetLayer = e.target;
                            targetLayer.setStyle({
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
    .catch(error => console.error('Error loading parking_meters.geojson:', error));

// Function to get color based on under.utilized status
function getColor(underUtilized) {
    return underUtilized ? 'red' : 'yellow';
}

// Load the nov_completed.geojson and add it to the map
fetch('data/nov_completed.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data || isEmpty(data)) {
            console.error('Empty or invalid GeoJSON for nov_completed.geojson');
            return;
        }

        var streetLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: getColor(feature.properties["under.utilized"]),
                    weight: 4,
                    opacity: 0.8
                };
            },
            onEachFeature: function (feature, layer) {
                let props = feature.properties;
                let utilizationStatus = props["under.utilized"] ? "Under Utilized" : "Optimally Utilized";

                let popupContent = `
                    <b>Street Name:</b> ${props.STREETNAME ?? 'N/A'} ${props.STYPE ?? ''} <br>
                    <b>Street ID:</b> ${props["street.ID"] ?? 'N/A'} <br>
                    <b>Total Occupancy:</b> ${props.total_occupied ?? 'N/A'} <br>
                    <b>Max Occupied:</b> ${props.max_occupied ?? 'N/A'} <br>
                    <b>Estimated Capacity:</b> ${props["estimated.capacity"]?.toFixed(2) ?? 'N/A'} <br>
                    <b>TOC:</b> ${props.toc ?? 'N/A'} <br>
                    <span class="utilization-status">${utilizationStatus}</span>
                `;

                layer.bindPopup(popupContent);

                // Highlight effect on hover
                layer.on({
                    mouseover: function (e) {
                        var targetLayer = e.target;
                        targetLayer.setStyle({
                            color: 'purple',
                            weight: 5
                        });
                    },
                    mouseout: function (e) {
                        streetLayer.resetStyle(e.target);
                    },
                    click: function (e) {
                        map.fitBounds(e.target.getBounds());
                    }
                });
            }
        }).addTo(map);

        map.fitBounds(streetLayer.getBounds()); // Adjust map view to the data
    })
    .catch(error => console.error('Error loading nov_completed.geojson:', error));
