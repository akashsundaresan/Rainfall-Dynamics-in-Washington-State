const actualMap = L.map('actual-map').setView([47.7511, -120.7401], 7);
const predictedMap = L.map('predicted-map').setView([47.7511, -120.7401], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(actualMap);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(predictedMap);

const getColor = (precipitation) => {
    return precipitation < 1 ? '#008000' : precipitation < 2.22 ? '#0000ff' : '#ff0000';
};

const createPoints = (data, map) => {
    if (window[map._container.id + 'Layer']) {
        window[map._container.id + 'Layer'].remove();
    }
    window[map._container.id + 'Layer'] = L.layerGroup().addTo(map);
    data.forEach(d => {
        const color = getColor(d.PRECIPITATION);
        L.circle([d.LAT, d.LON], { color, fillColor: color, fillOpacity: 0.7, radius: 5000 }).addTo(window[map._container.id + 'Layer']);
    });
};

Promise.all([
    d3.csv('Original2019.csv'),
    d3.csv('Predicted2019.csv')
]).then(([actualData, predictedData]) => {
    actualData = processData(actualData, 'Original2019.csv');
    predictedData = processData(predictedData, 'Predicted2019.csv');

    document.getElementById('time-slider').addEventListener('input', function() {
        const sliderValue = parseInt(this.value);
        updateDisplay(sliderValue);
        createPoints(filterData(actualData, sliderValue), actualMap);
        createPoints(filterData(predictedData, sliderValue), predictedMap);
    });

    updateDisplay(0);
    createPoints(filterData(actualData, 0), actualMap);
    createPoints(filterData(predictedData, 0), predictedMap);
});

const processData = (data, filename) => {
    console.log(`Processing data from ${filename}`, data); // Debugging line
    return data.map(d => ({
        YEAR: +d.YEAR,
        MONTH: +d.MONTH,
        LAT: +d.LAT,
        LON: +d.LON,
        PRECIPITATION: +d.PRCP
    }));
};

const filterData = (data, sliderValue) => {
    const month = (sliderValue % 4) + 1; 
    console.log(`Filtering data for month: ${month}`); // Debugging line
    return data.filter(d => d.YEAR === 2019 && d.MONTH === month);
};

const updateDisplay = (sliderValue) => {
    const monthNames = ["January", "February", "March", "April"];
    document.getElementById('date-display').textContent = `${monthNames[sliderValue]} 2019`;
};

// Function to add legends to the maps
const addLegend = (map) => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const categories = [
            { label: "Low Precipitation", color: '#008000' },
            { label: "Medium Precipitation", color: '#0000ff' },
            { label: "High Precipitation", color: '#ff0000' }
        ];

        categories.forEach(category => {
            div.innerHTML +=
                '<i style="background:' + category.color + '"></i> ' +
                '<span style="color:' + category.color + '">' + category.label + '</span><br>';
        });

        return div;
    };

    legend.addTo(map);
};

// Add legends to both maps
addLegend(actualMap);
addLegend(predictedMap);