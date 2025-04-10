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

const ScatterPlot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format numbers
    const formatNumber = d3.format(',');

    // Chart dimensions
    const margin = { top: 30, right: 100, bottom: 60, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Filter out entries without both cases and deaths
    const filteredData = data.filter(d => 
      d.total_cases > 0 && 
      d.total_deaths > 0 && 
      d.location && 
      d.location !== 'World' && 
      d.location !== 'International'
    );

    // X axis - total cases (log scale)
    const x = d3.scaleLog()
      .domain([100, d3.max(filteredData, d => d.total_cases) * 1.1])
      .range([0, width]);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => formatNumber(d)))
      .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text('Total Cases (log scale)');

    // Y axis - total deaths (log scale)
    const y = d3.scaleLog()
      .domain([1, d3.max(filteredData, d => d.total_deaths) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatNumber(d)))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text('Total Deaths (log scale)');

    // Add tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 999);

    // Color scale for continents
    const color = d3.scaleOrdinal()
      .domain(Array.from(new Set(filteredData.map(d => d.continent || 'Unknown'))))
      .range(d3.schemeCategory10);

    // Add dots
    svg.append('g')
      .selectAll('dot')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.total_cases))
      .attr('cy', d => y(d.total_deaths))
      .attr('r', 5)
      .style('fill', d => color(d.continent || 'Unknown'))
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .style('opacity', 1);
          
        tooltip
          .style('opacity', 1)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 30) + 'px')
          .html(`
            <strong>${d.location}</strong><br>
            Continent: ${d.continent || 'Unknown'}<br>
            Total Cases: ${formatNumber(d.total_cases)}<br>
            Total Deaths: ${formatNumber(d.total_deaths)}<br>
            Case Fatality Rate: ${(d.total_deaths / d.total_cases * 100).toFixed(2)}%
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 5)
          .style('opacity', 0.7);
          
        tooltip.style('opacity', 0);
      });

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(color.domain().sort())
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);

    legend.append('rect')
      .attr('x', width + 20)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.append('text')
      .attr('x', width + 45)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text(d => d);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('COVID-19: Cases vs Deaths by Country');
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default ScatterPlot;
