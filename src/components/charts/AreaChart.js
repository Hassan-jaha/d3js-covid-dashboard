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

const AreaChart = ({ data, country }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format numbers
    const formatNumber = d3.format(',');

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat('%b %Y')));

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_cases) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatNumber(d)));

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Cumulative Cases');

    // Add area for cases
    svg.append('path')
      .datum(data)
      .attr('fill', 'rgba(70, 130, 180, 0.4)')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.total_cases || 0))
      );
      
    // Add area for deaths
    svg.append('path')
      .datum(data)
      .attr('fill', 'rgba(188, 30, 30, 0.4)')
      .attr('stroke', '#bc1e1e')
      .attr('stroke-width', 1.5)
      .attr('d', d3.area()
        .x(d => x(d.date))
        .y0(height)
        .y1(d => y(d.total_deaths || 0))
      );

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, 10)`);
    
    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', 'rgba(70, 130, 180, 0.4)')
      .attr('stroke', 'steelblue');
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text('Total Cases')
      .style('font-size', '12px');

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('y', 25)
      .attr('fill', 'rgba(188, 30, 30, 0.4)')
      .attr('stroke', '#bc1e1e');
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 37)
      .text('Total Deaths')
      .style('font-size', '12px');

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

    // Add interactive overlay
    const bisect = d3.bisector(d => d.date).left;
    
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => tooltip.style('opacity', 1))
      .on('mouseout', () => tooltip.style('opacity', 0))
      .on('mousemove', function(event) {
        const x0 = x.invert(d3.pointer(event, this)[0]);
        const i = bisect(data, x0, 1);
        
        if (i >= data.length) return;
        
        const d0 = data[i - 1];
        const d1 = data[i];
        
        if (!d0 || !d1) return;
        
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        
        tooltip
          .style('opacity', 1)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 30) + 'px')
          .html(`
            <strong>Date: ${d3.timeFormat('%B %d, %Y')(d.date)}</strong><br>
            Total Cases: ${formatNumber(d.total_cases || 0)}<br>
            Total Deaths: ${formatNumber(d.total_deaths || 0)}<br>
            Case Fatality Rate: ${((d.total_deaths / d.total_cases) * 100).toFixed(2)}%
          `);
      });

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text(`COVID-19 in ${country || 'Selected Country'}`);
      
  }, [data, country]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default AreaChart;
