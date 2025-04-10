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

const BarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 120, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Format numbers
    const formatNumber = d3.format(',');

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.location))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_cases) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));

    // Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Total COVID-19 Cases');

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

    // Bars
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.location))
      .attr('y', d => y(d.total_cases))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.total_cases))
      .attr('fill', '#69b3a2')
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', '#3498db');
        
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.location}</strong><br>
            Total Cases: ${formatNumber(d.total_cases)}<br>
            Total Deaths: ${formatNumber(d.total_deaths)}<br>
            Case Fatality Rate: ${(d.total_deaths / d.total_cases * 100).toFixed(2)}%
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('fill', '#69b3a2');
        tooltip.style('opacity', 0);
      });

    // Add values on top of bars
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('x', d => x(d.location) + x.bandwidth() / 2)
      .attr('y', d => y(d.total_cases) - 5)
      .text(d => {
        const millions = d.total_cases / 1000000;
        return millions >= 1 ? `${millions.toFixed(1)}M` : `${(d.total_cases / 1000).toFixed(0)}K`;
      })
      .style('font-size', '10px');

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Top Countries by Total COVID-19 Cases');
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default BarChart;
