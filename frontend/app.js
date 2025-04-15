// Initialize the map
const map = L.map('map').setView([40.7128, -74.0060], 12); // Default to New York

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Markers layer
const markers = L.layerGroup().addTo(map);

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const searchResults = document.getElementById('search-results');
const directionsButton = document.getElementById('directions-button');
const directionsPanel = document.getElementById('directions-panel');
const closeDirections = document.getElementById('close-directions');
const originInput = document.getElementById('origin-input');
const destinationInput = document.getElementById('destination-input');
const travelMode = document.getElementById('travel-mode');
const getDirectionsButton = document.getElementById('get-directions');
const directionsResults = document.getElementById('directions-results');
const myLocationButton = document.getElementById('my-location-button');

// Event Listeners
searchButton.addEventListener('click', performSearch);
closeSidebar.addEventListener('click', () => sidebar.classList.remove('active'));
directionsButton.addEventListener('click', () => directionsPanel.classList.add('active'));
closeDirections.addEventListener('click', () => directionsPanel.classList.remove('active'));
getDirectionsButton.addEventListener('click', getDirections);
myLocationButton.addEventListener('click', locateUser);

// Also trigger search on Enter key
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

// Perform search function
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const results = await response.json();
        
        displaySearchResults(results);
        plotMarkers(results);
        
        // Show sidebar
        sidebar.classList.add('active');
    } catch (error) {
        console.error('Search error:', error);
        alert('Failed to perform search. Please try again.');
    }
}

// Display search results in sidebar
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <h4>${result.name}</h4>
            <p>${result.address}</p>
        `;
        
        resultItem.addEventListener('click', () => {
            map.setView([result.lat, result.lng], 15);
            highlightMarker(result);
        });
        
        searchResults.appendChild(resultItem);
    });
}

// Plot markers on the map
function plotMarkers(results) {
    markers.clearLayers();
    
    results.forEach(result => {
        const marker = L.marker([result.lat, result.lng]).addTo(markers);
        
        marker.bindPopup(`
            <h3>${result.name}</h3>
            <p>${result.address}</p>
        `);
        
        // Store original result data with marker
        marker.resultData = result;
    });
}

// Highlight a specific marker
function highlightMarker(result) {
    markers.eachLayer(marker => {
        if (marker.resultData.lat === result.lat && marker.resultData.lng === result.lng) {
            marker.openPopup();
        }
    });
}

// Get directions function
async function getDirections() {
    const origin = originInput.value.trim();
    const destination = destinationInput.value.trim();
    const mode = travelMode.value;
    
    if (!origin || !destination) {
        alert('Please enter both origin and destination');
        return;
    }
    
    try {
        // First geocode origin and destination to get coordinates
        const [originCoords, destCoords] = await Promise.all([
            geocodeAddress(origin),
            geocodeAddress(destination)
        ]);
        
        // Then get directions
        const response = await fetch('/api/directions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: `${originCoords.lat},${originCoords.lng}`,
                destination: `${destCoords.lat},${destCoords.lng}`,
                mode: mode
            })
        });
        
        const route = await response.json();
        displayDirections(route.routes[0]);
        plotRoute(route.routes[0]);
        
    } catch (error) {
        console.error('Directions error:', error);
        alert('Failed to get directions. Please try again.');
    }
}

// Geocode an address to coordinates
async function geocodeAddress(address) {
    const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
    return await response.json();
}

// Display directions in the panel
function displayDirections(route) {
    directionsResults.innerHTML = '';
    
    const summary = document.createElement('div');
    summary.className = 'direction-step';
    summary.innerHTML = `
        <h3>Route Summary</h3>
        <p>Distance: ${(route.distance / 1000).toFixed(1)} km</p>
        <p>Duration: ${Math.floor(route.duration / 60)} min</p>
    `;
    directionsResults.appendChild(summary);
    
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            const stepElement = document.createElement('div');
            stepElement.className = 'direction-step';
            stepElement.innerHTML = `
                <h4>${step.instruction}</h4>
                <p>Distance: ${step.distance} meters</p>
                <p>Duration: ${step.duration} seconds</p>
            `;
            directionsResults.appendChild(stepElement);
        });
    });
}

// Plot route on the map
function plotRoute(route) {
    // Decode the polyline (in a real app, you'd use a proper decoder)
    // For demo, we'll just draw a straight line between origin and destination
    if (route.legs.length > 0 && route.legs[0].steps.length > 0) {
        const firstStep = route.legs[0].steps[0];
        const lastStep = route.legs[route.legs.length - 1].steps[route.legs[route.legs.length - 1].steps.length - 1];
        
        // This is simplified - in a real app you'd decode the polyline properly
        const routeLine = L.polyline([
            [firstStep.polyline.split(',')[0], firstStep.polyline.split(',')[1]],
            [lastStep.polyline.split(',')[0], lastStep.polyline.split(',')[1]]
        ], {color: 'blue'}).addTo(map);
        
        // Fit the map to the route bounds
        map.fitBounds(routeLine.getBounds());
    }
}

// Locate the user
function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                
                // Add a marker at user's location
                L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup('Your location')
                    .openPopup();
            },
            error => {
                alert(`Geolocation error: ${error.message}`);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
}