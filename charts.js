// Load data from CSV file
d3.csv('atl_weather_20to22.csv').then(data => {
    createBarChart(data);
    createScatterplot(data);
    createLineGraph(data);
}).catch(error => {
    console.error('Error loading data:', error);
});

// Bar Chart
function createBarChart(weatherData) {
    // Parse the dates and convert precipitation to numeric values
    weatherData.forEach(d => {
        d.Date = new Date(d.Date);
        d.Precip = +d.Precip;
    });
    
    // Group data by month and sum the precipitation
    const dataByMonth = d3.rollup(
        weatherData,
        v => d3.sum(v, d => d.Precip),
        d => d3.timeFormat('%B')(d.Date)
    );

    // Convert grouped data to an array
    const aggregatedData = Array.from(dataByMonth, ([month, totalPrecipitation]) => ({ month, totalPrecipitation }));

    // Set up SVG container and scales
    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 60 }; 

    // Create SVG element
    const svg = d3.select('#barChart').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create X and Y scales
    const xScale = d3.scaleBand()
        .domain(aggregatedData.map(d => d.month))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(aggregatedData, d => d.totalPrecipitation)])
        .range([height - margin.bottom, margin.top]);

    // Draw bars
    svg.selectAll('rect')
        .data(aggregatedData)
        .enter().append('rect')
        .attr('x', d => xScale(d.month))
        .attr('y', d => yScale(d.totalPrecipitation))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.bottom - yScale(d.totalPrecipitation))
        .attr('fill', 'steelblue');

    // Draw axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append X axis
    svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

    // X axis title
    svg.append('text')
    .attr('x', width / 2)
    .attr('y', height - 5) 
    .style('text-anchor', 'middle')
    .text('Month');

    // Append Y axis
    svg.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(yAxis);

    // Y axis title
    svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', margin.left - 40) 
    .style('text-anchor', 'middle')
    .text('Total Precipitation');

    // Legend
    const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - margin.right}, ${margin.top})`);

    legend.append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('y', -10)
        .attr('fill', 'steelblue');

    legend.append('text')
        .attr('x', -80)
        .attr('y', -30)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Monthly Precipitation');

}






// Scatterplot
function createScatterplot(weatherData) {
    const width = 600;
    const height = 400;
    const margin = { top: 50, right: 20, bottom: 50, left: 60 };

    // Parse the dates and convert numeric values
    weatherData.forEach(d => {
        d.Date = new Date(d.Date);
        d.Pressure = +d.Pressure;
        d.Dewpoint = +d.Dewpoint;
        d.TempMax = +d.TempMax;
        d.TempMin = +d.TempMin;
    });

    // Calculate TempDiff
    weatherData.forEach(d => {
        d.TempDiff = d.TempMax - d.TempMin;
    });

    // Set up SVG container and scales
    const svg = d3.select('#scatterplot').append('svg')
        .attr('width', width)
        .attr('height', height);

    const xScale = d3.scaleLinear()
        .domain([d3.min(weatherData, d => d.Pressure), d3.max(weatherData, d => d.Pressure)])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(weatherData, d => d.Dewpoint), d3.max(weatherData, d => d.Dewpoint)])
        .range([height - margin.bottom, margin.top]);

    const radiusScale = d3.scaleLinear()
        .domain(d3.extent(weatherData, d => d.Precip))
        .range([3, 20]);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain(d3.extent(weatherData, d => d.TempDiff));

    // Draw circles in the scatterplot with varying size, opacity, and color
    svg.selectAll('circle')
    .data(weatherData)
    .enter().append('circle')
    .attr('cx', d => xScale(d.Pressure))
    .attr('cy', d => yScale(d.Dewpoint))
    .attr('r', d => radiusScale(d.Precip))
    .attr('fill', d => colorScale(d.TempDiff))
    .attr('opacity', 0.8); 

    // Draw axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Append X axis
    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(xAxis);

    // X axis title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .style('text-anchor', 'middle')
        .text('Pressure');

    // Append Y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(yAxis);

    // Y axis title
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', margin.left - 40)
        .style('text-anchor', 'middle')
        .text('Dewpoint');

    // Add color legend
    const colorLegend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 100}, 20)`);

    const colorStops = d3.range(0, 1.1, 0.1);

    colorLegend.append('linearGradient')
        .attr('id', 'colorLegendGradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', 0).attr('y2', 100)
        .selectAll('stop')
        .data(colorStops)
        .enter().append('stop')
        .attr('offset', (d, i) => `${i * 100 / (colorStops.length - 1)}%`)
        .attr('stop-color', d => d3.interpolateViridis(d));

    colorLegend.append('rect')
        .attr('width', 20)
        .attr('height', 100)
        .attr('fill', 'url(#colorLegendGradient)');

    colorLegend.append('text')
        .attr('x', -160)
        .attr('y', -10)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('Difference in Max and Min Temperatures');

    colorLegend.append('text')
        .attr('x', 30)
        .attr('y', 10)
        .style('font-size', '10px')
        .text('Low');

    colorLegend.append('text')
        .attr('x', 30)
        .attr('y', 95)
        .style('font-size', '10px')
        .text('High');

    // Add size legend
    const sizeLegend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${margin.left + 10}, ${height - margin.bottom - 10})`); 

    sizeLegend.append('text')
        .attr('x', 5)
        .attr('y', -130)
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .text('Precipitation');
    

    sizeLegend.selectAll('circle')
        .data([1, 3, 5]) 
        .enter().append('circle')
        .attr('cx', 30)
        .attr('cy', (d, i) => -15 - i * 40) 
        .attr('r', d => radiusScale(d))
        .attr('fill', 'none') 
        .attr('stroke', 'black');

    sizeLegend.selectAll('line')
        .data([1, 3, 5]) 
        .enter().append('line')
        .attr('x1', d => 30 + radiusScale(d)) 
        .attr('y1', (d, i) => -15 - i * 40) 
        .attr('x2', 60) 
        .attr('y2', (d, i) => -15 - i * 40) 
        .attr('stroke', 'black');

    sizeLegend.selectAll('text')
        .data([0, 1.0, 3.0, 5.0]) 
        .enter().append('text')
        .attr('x', 65)
        .attr('y', (d, i) => 30 - i * 40) 
        .style('text-anchor', 'start')
        .style('font-size', '12px')
        .text(d => ` ${d.toFixed(1)}`);
}





// Line Graph
function createLineGraph(weatherData) {
    weatherData.forEach(d => {
        d.Date = new Date(d.Date);
        d.TempMax = +d.TempMax;
        d.TempMin = +d.TempMin;
    });

    const margin = { top: 10, right: 80, bottom: 50, left: 80 }; 
    const fullWidth = window.innerWidth;
    const width = fullWidth - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3.select('#lineGraph').append('svg')
        .attr('width', fullWidth)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleTime()
        .domain(d3.extent(weatherData, d => d.Date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(weatherData, d => d.TempMin), d3.max(weatherData, d => d.TempMax)])
        .range([height, 0]);

    const lineTempMax = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.TempMax));

    const lineTempMin = d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.TempMin));

    svg.append('path')
        .data([weatherData])
        .attr('class', 'line line-temp-max') 
        .attr('d', lineTempMax);

    svg.append('path')
        .data([weatherData])
        .attr('class', 'line line-temp-min') 
        .attr('d', lineTempMin);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append('g')
        .call(yAxis);


    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.top + 25) 
        .style('text-anchor', 'middle')
        .text('Date');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Temperature (°F)');


    // legend
    const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - margin.right}, ${margin.top})`);

    legend.append('path')
    .attr('class', 'line line-temp-max')
    .attr('d', 'M0,5L30,5')
    .attr('stroke', 'steelblue');

    legend.append('text')
    .attr('x', 35)
    .attr('y', 9)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text('Max Temperature');

    legend.append('path')
    .attr('class', 'line line-temp-min')
    .attr('d', 'M0,25L30,25')
    .attr('stroke', 'orange');

    legend.append('text')
    .attr('x', 35)
    .attr('y', 29)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text('Min Temperature');
}
