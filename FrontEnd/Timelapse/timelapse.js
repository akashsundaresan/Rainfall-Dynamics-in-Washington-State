// Initialize the Leaflet map
const map = L.map('map').setView([47.7511, -120.7401], 7); // Centered on Washington State

// Add a base layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to determine the color based on precipitation
const getColor = (precipitation) => {
    if (precipitation < 0.05) return '#008000'; // Light green for low precipitation
    else if (precipitation < 0.2) return '#0000ff'; // Blue for moderate precipitation
    else return '#ff0000'; // Red for high precipitation
};

// Function to create points with varying colors
const createPoints = (data, sliderValue) => {
    // Calculate year and month from sliderValue
    const year = Math.floor(sliderValue / 12) + 2000;
    const month = (sliderValue % 12) + 1;

    // Filter data for the specific year and month
    const filteredData = data.filter(d => d.YEAR === year && d.MONTH === month);

    // Remove previous data layers
    if (window.dataLayer) {
        window.dataLayer.remove();
    }

    // Create a new layer for data points
    window.dataLayer = L.layerGroup().addTo(map);

    // Add circles to the data layer with varying colors
    filteredData.forEach(d => {
        const color = getColor(d.PRECIPITATION);
        L.circle([d.LAT, d.LON], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 5000 // Adjust as needed
        }).addTo(window.dataLayer);
    });
};

// Load data and set up the slider functionality
d3.csv('WashingtonWeather.csv').then(data => {
    // Convert numerical fields from string to numbers
    data.forEach(d => {
        d.YEAR = +d.YEAR;
        d.MONTH = +d.MONTH;
        d.LAT = +d.LAT;
        d.LON = +d.LON;
        d.PRECIPITATION = +d.PRCP; 
    });

    // Add event listener to the slider
    document.getElementById('time-slider').addEventListener('input', function() {
        updateDisplay(this.value);
        createPoints(data, this.value);
    });

    // Initial setup
    updateDisplay(0);
    createPoints(data, 0);
});

// Function to update the display of month and year
const updateDisplay = (sliderValue) => {
    const year = Math.floor(sliderValue / 12) + 2000;
    const monthIndex = (sliderValue % 12);
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[monthIndex];

    document.getElementById('date-display').textContent = `${monthName} ${year}`;
};

// Add a legend to the map
const legend = L.control({ position: 'bottomright' });

legend.onAdd = () => {
    const div = L.DomUtil.create('div', 'info legend');
    const categories = [
        { label: "Low Precipitation", color: '#008000' },
        { label: "Medium Precipitation", color: '#0000ff' },
        { label: "High Precipitation", color: '#ff0000' }
    ];

    // Generate a label with a colored square and text for each category
    categories.forEach(category => {
        div.innerHTML +=
            '<i style="background:' + category.color + '"></i> ' +
            '<span style="color:' + category.color + '">' + category.label + '</span><br>';
    });

    return div;
};

legend.addTo(map);