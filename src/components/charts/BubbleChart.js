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

const BubbleChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format numbers
    const formatNumber = d3.format(',');

    // Chart dimensions
    const width = 800;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`);

    // Filter data for countries with all needed metrics
    const filteredData = data.filter(d => 
      d.total_cases > 0 && 
      d.total_deaths > 0 && 
      d.population > 0 && 
      d.continent && 
      d.location !== 'World'
    );

    // Size scale for bubbles based on population
    const size = d3.scaleLog()
      .domain([d3.min(filteredData, d => d.population), d3.max(filteredData, d => d.population)])
      .range([10, 50]);

    // Color scale for continents
    const color = d3.scaleOrdinal()
      .domain(Array.from(new Set(filteredData.map(d => d.continent))))
      .range(d3.schemeCategory10);

    // Create a simulation with forces
    const simulation = d3.forceSimulation(filteredData)
      .force('center', d3.forceCenter().x(0).y(0))
      .force('charge', d3.forceManyBody().strength(5))
      .force('collide', d3.forceCollide().radius(d => size(d.population) + 2).iterations(2));

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

    // Add bubbles
    const bubbles = svg.selectAll('.bubble')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', d => size(d.population))
      .attr('fill', d => color(d.continent))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('opacity', 0.8)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke-width', 2);
        
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.location}</strong> (${d.continent})<br>
            Population: ${formatNumber(d.population)}<br>
            Total Cases: ${formatNumber(d.total_cases)}<br>
            Total Deaths: ${formatNumber(d.total_deaths)}<br>
            Case Fatality Rate: ${(d.total_deaths / d.total_cases * 100).toFixed(2)}%<br>
            Cases per Million: ${formatNumber((d.total_cases / d.population * 1000000).toFixed(0))}<br>
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 30) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('stroke-width', 1);
        
        tooltip.style('opacity', 0);
      });

    // Add country labels for the largest bubbles
    const labels = svg.selectAll('.label')
      .data(filteredData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => {
        // Only show labels for bubbles above a certain size
        return size(d.population) > 30 ? d.location : '';
      })
      .style('font-size', '10px')
      .style('text-anchor', 'middle')
      .style('fill', '#333')
      .style('pointer-events', 'none');

    // Update bubble and label positions on simulation tick
    simulation.on('tick', () => {
      bubbles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
      
      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${-width/2 + 20}, ${-height/2 + 20 + i * 20})`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', color);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text(d => d);

    // Add legend for bubble size
    const sizeLegend = svg.append('g')
      .attr('transform', `translate(${-width/2 + 20}, ${height/2 - 100})`);
    
    const legendSizes = [1000000, 100000000, 1000000000]; // 1M, 100M, 1B
    
    sizeLegend.append('text')
      .attr('x', 0)
      .attr('y', -10)
      .text('Population')
      .style('font-weight', 'bold');
    
    legendSizes.forEach((s, i) => {
      sizeLegend.append('circle')
        .attr('cx', 40)
        .attr('cy', i * 40)
        .attr('r', size(s))
        .attr('fill', 'none')
        .attr('stroke', '#333');
      
      sizeLegend.append('text')
        .attr('x', 80)
        .attr('y', i * 40 + 5)
        .text(formatNumber(s));
    });

    // Title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height/2 + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('COVID-19 Impact by Country Population');
      
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default BubbleChart;
