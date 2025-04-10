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

const PieChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Chart dimensions
    const width = 550;
    const height = 550;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    // Format numbers
    const formatNumber = d3.format(',');

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width/2}, ${height/2})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.continent))
      .range(d3.schemeCategory10);

    // Compute total for percentage calculation
    const total = d3.sum(data, d => d.total_cases);

    // Pie generator
    const pie = d3.pie()
      .value(d => d.total_cases)
      .sort(null);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('padding', '10px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', 1000);

    // Generate pie chart
    const arcs = svg.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add path (slices)
    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.continent))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function(event, d) {
        d3.select(this).transition()
          .duration(200)
          .attr('opacity', 0.7);
          
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
          
        const percent = (d.data.total_cases / total * 100).toFixed(1);
        
        tooltip.html(`
          <strong>${d.data.continent}</strong><br>
          Cases: ${formatNumber(d.data.total_cases)}<br>
          Deaths: ${formatNumber(d.data.total_deaths || 0)}<br>
          Percentage: ${percent}%
        `)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).transition()
          .duration(200)
          .attr('opacity', 1);
          
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });

    // Add labels for larger slices
    arcs.append('text')
      .attr('transform', d => {
        const centroid = arc.centroid(d);
        return `translate(${centroid[0]}, ${centroid[1]})`;
      })
      .attr('text-anchor', 'middle')
      .text(d => {
        // Only show label if the slice is big enough
        return d.endAngle - d.startAngle > 0.25 ? d.data.continent : '';
      })
      .style('font-size', '14px')
      .style('fill', 'white');

    // Add legend
    const legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${radius + 20},${-radius + 20 + i * 25})`);

    legend.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend.append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text(d => d);

    // Title
    svg.append('text')
      .attr('x', 0)
      .attr('y', -height/2 + 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('COVID-19 Cases by Continent');
      
  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default PieChart;
