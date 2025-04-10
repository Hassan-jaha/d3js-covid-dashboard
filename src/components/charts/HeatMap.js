import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const ChartContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const HeatMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format numbers
    const formatNumber = d3.format(',');

    // Chart dimensions
    const margin = { top: 50, right: 80, bottom: 120, left: 150 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Select top countries by total cases
    const topCountries = Array.from(
      data.filter(d => d.continent && d.total_cases > 1000)
        .sort((a, b) => b.total_cases - a.total_cases)
        .slice(0, 20)
        .map(d => d.location)
    );

    // Define metrics to display
    const metrics = [
      { id: 'total_cases', name: 'Total Cases' },
      { id: 'total_deaths', name: 'Total Deaths' },
      { id: 'total_cases_per_million', name: 'Cases per Million' },
      { id: 'total_deaths_per_million', name: 'Deaths per Million' },
      { id: 'case_fatality_rate', name: 'Case Fatality Rate (%)' }
    ];

    // Create derived metrics if needed
    const processedData = data.map(d => ({
      ...d,
      total_cases_per_million: d.population ? (d.total_cases / d.population) * 1000000 : 0,
      total_deaths_per_million: d.population ? (d.total_deaths / d.population) * 1000000 : 0,
      case_fatality_rate: d.total_cases ? (d.total_deaths / d.total_cases) * 100 : 0
    }));

    // Prepare heatmap data
    const heatmapData = [];
    topCountries.forEach(country => {
      const countryData = processedData.find(d => d.location === country);
      
      if (countryData) {
        metrics.forEach(metric => {
          heatmapData.push({
            country,
            metric: metric.name,
            value: countryData[metric.id] || 0
          });
        });
      }
    });

    // X axis - metrics
    const x = d3.scaleBand()
      .domain(metrics.map(d => d.name))
      .range([0, width])
      .padding(0.05);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Y axis - countries
    const y = d3.scaleBand()
      .domain(topCountries)
      .range([0, height])
      .padding(0.05);
    
    svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px');

    // Create separate color scales for different metrics
    const colorScales = {
      'Total Cases': d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([0, d3.max(heatmapData.filter(d => d.metric === 'Total Cases'), d => d.value)]),
      'Total Deaths': d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([0, d3.max(heatmapData.filter(d => d.metric === 'Total Deaths'), d => d.value)]),
      'Cases per Million': d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([0, d3.max(heatmapData.filter(d => d.metric === 'Cases per Million'), d => d.value)]),
      'Deaths per Million': d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([0, d3.max(heatmapData.filter(d => d.metric === 'Deaths per Million'), d => d.value)]),
      'Case Fatality Rate (%)': d3.scaleSequential()
        .interpolator(d3.interpolateYlOrRd)
        .domain([0, d3.max(heatmapData.filter(d => d.metric === 'Case Fatality Rate (%)'), d => d.value)])
    };

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Create heatmap cells
    svg.selectAll('rect')
      .data(heatmapData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.metric))
      .attr('y', d => y(d.country))
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => colorScales[d.metric](d.value))
      .style('stroke', 'white')
      .style('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .style('stroke', '#333')
          .style('stroke-width', 2);
        
        let formattedValue;
        if (d.metric === 'Case Fatality Rate (%)') {
          formattedValue = d.value.toFixed(2) + '%';
        } else if (d.metric.includes('Million')) {
          formattedValue = formatNumber(Math.round(d.value));
        } else {
          formattedValue = formatNumber(d.value);
        }
        
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.country}</strong><br>
            ${d.metric}: ${formattedValue}
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 30) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .style('stroke', 'white')
          .style('stroke-width', 1);
        
        tooltip.style('opacity', 0);
      });

    // Add color legends
    metrics.forEach((metric, i) => {
      const legendWidth = 20;
      const legendHeight = 150;
      const legendX = width + 15;
      const legendY = i * (legendHeight + 30);
      
      // Create gradient
      const defs = svg.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', `gradient-${metric.id}`)
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');

      // Set colors for gradient
      linearGradient.selectAll('stop')
        .data(d3.range(0, 1.1, 0.1))
        .enter()
        .append('stop')
        .attr('offset', d => d)
        .attr('stop-color', d => colorScales[metric.name](
          d * colorScales[metric.name].domain()[1]
        ));

      // Draw legend rectangle
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', `url(#gradient-${metric.id})`);

      // Legend title
      svg.append('text')
        .attr('x', legendX)
        .attr('y', legendY - 5)
        .text(metric.name)
        .style('font-size', '10px');

      // Legend scale
      const legendScale = d3.scaleLinear()
        .domain([0, colorScales[metric.name].domain()[1]])
        .range([legendHeight, 0]);

      const ticks = metric.name === 'Case Fatality Rate (%)' ? 
        [0, 2, 4, 6, 8, 10] : 
        legendScale.ticks(5);

      const legendAxis = svg.append('g')
        .attr('transform', `translate(${legendX + legendWidth},${legendY})`)
        .call(
          d3.axisRight(legendScale)
            .tickValues(ticks)
            .tickFormat(d => {
              if (metric.name === 'Case Fatality Rate (%)') {
                return d + '%';
              } else if (d >= 1000000) {
                return (d / 1000000) + 'M';
              } else if (d >= 1000) {
                return (d / 1000) + 'K';
              } else {
                return d;
              }
            })
        );
      
      legendAxis.selectAll('text')
        .style('font-size', '8px');
    });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('COVID-19 Metrics by Country');
      
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default HeatMap;
