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

const LineChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions
    const margin = { top: 30, right: 80, bottom: 50, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Format numbers
    const formatNumber = d3.format(',');

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left + 30 },${margin.top})`);

    // X axis - time scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(10).tickFormat(d3.timeFormat('%b %Y')));

    // Y axis - linear scale for cases
    const y1 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_cases) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y1).tickFormat(d => formatNumber(d)));

    // Secondary Y axis - linear scale for deaths
    const y2 = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total_deaths) * 1.1])
      .range([height, 0]);
    
    svg.append('g')
      .attr('transform', `translate(${width}, 0)`)
      .call(d3.axisRight(y2).tickFormat(d => formatNumber(d)));

    // Add the cases line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#377eb8')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d.date))
        .y(d => y1(d.total_cases))
      );

    // Add the deaths line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#e41a1c')
      .attr('stroke-width', 2)
      .attr('d', d3.line()
        .x(d => x(d.date))
        .y(d => y2(d.total_deaths))
      );

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 150}, 0)`);
    
    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#377eb8');
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 12.5)
      .text('Total Cases')
      .style('font-size', '12px');

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('y', 25)
      .attr('fill', '#e41a1c');
    
    legend.append('text')
      .attr('x', 20)
      .attr('y', 37.5)
      .text('Total Deaths')
      .style('font-size', '12px');

    // Add Y axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Total Cases');
    
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', width + 45)
      .attr('x', -height / 2)
      .attr('text-anchor', 'middle')
      .text('Total Deaths');

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
      .style('z-index', 999);

    // Add interactive elements for tooltip
    const bisect = d3.bisector(d => d.date).left;
    
    const focus = svg.append('g')
      .style('display', 'none');
    
    // Add vertical line
    focus.append('line')
      .attr('class', 'tooltip-line')
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#777')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');
    
    // Add circles on the lines
    focus.append('circle')
      .attr('class', 'tooltip-circle-cases')
      .attr('r', 5)
      .attr('fill', '#377eb8');
    
    focus.append('circle')
      .attr('class', 'tooltip-circle-deaths')
      .attr('r', 5)
      .attr('fill', '#e41a1c');

    // Overlay for mouse events
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('opacity', 0);
      })
      .on('mousemove', function(event) {
        const x0 = x.invert(d3.pointer(event, this)[0]);
        const i = bisect(data, x0, 1);
        
        if (i >= data.length) return;
        
        const d0 = data[i - 1];
        const d1 = data[i];
        
        if (!d0 || !d1) return;
        
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        
        focus.select('.tooltip-line')
          .attr('x1', x(d.date))
          .attr('x2', x(d.date));
        
        focus.select('.tooltip-circle-cases')
          .attr('cx', x(d.date))
          .attr('cy', y1(d.total_cases || 0));

        focus.select('.tooltip-circle-deaths')
          .attr('cx', x(d.date))
          .attr('cy', y2(d.total_deaths || 0));

        
        tooltip
          .style('opacity', 1)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 30) + 'px')
          .html(`
            <strong>Date: ${d3.timeFormat('%B %d, %Y')(d.date)}</strong><br>
            Total Cases: ${formatNumber(d.total_cases)}<br>
            Total Deaths: ${formatNumber(d.total_deaths)}
          `);
      });
    
    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('Global COVID-19 Cases and Deaths');
      
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default LineChart;
