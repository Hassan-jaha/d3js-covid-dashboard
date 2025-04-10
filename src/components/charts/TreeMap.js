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

const TreeMap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !data.length) return;

    // Clear any previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Format numbers
    const formatNumber = d3.format(',');

    // Chart dimensions
    const width = 900;
    const height = 600;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(0,0)');

    // Filter and organize data
    const filteredData = data.filter(d => 
      d.continent && d.total_cases > 0 && d.location !== 'World'
    );

    // Create hierarchical structure
    const nestedData = {
      name: 'COVID-19 Cases',
      children: Array.from(
        d3.group(filteredData, d => d.continent),
        ([continent, countries]) => ({
          name: continent,
          children: countries.map(country => ({
            name: country.location,
            value: country.total_cases,
            deaths: country.total_deaths,
            casesPer1M: country.population ? (country.total_cases / country.population * 1000000).toFixed(0) : 0,
            deathsPer1M: country.population ? (country.total_deaths / country.population * 1000000).toFixed(0) : 0,
            cfr: country.total_cases ? (country.total_deaths / country.total_cases * 100).toFixed(2) : 0,
            continent: country.continent
          }))
        })
      )
    };

    // Generate root node from hierarchy
    const root = d3.hierarchy(nestedData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Create treemap layout
    const treemap = d3.treemap()
      .size([width, height])
      .paddingTop(28)
      .paddingRight(7)
      .paddingInner(3);

    // Generate treemap coordinates
    treemap(root);

    // Create tooltip
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

    // Create color scale for continents
    const colorScale = d3.scaleOrdinal()
      .domain(Array.from(new Set(filteredData.map(d => d.continent))))
      .range(d3.schemeCategory10);

    // Add continent sections
    const continents = svg.selectAll('.continent')
      .data(root.children)
      .enter()
      .append('g')
      .attr('class', 'continent');

    // Add continent labels
    continents.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', 28)
      .attr('fill', d => colorScale(d.data.name))
      .attr('opacity', 0.9);

    continents.append('text')
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 18)
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .text(d => `${d.data.name} - ${formatNumber(d.value)} cases`);

    // Add country rectangles
    const countries = svg.selectAll('.country')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'country');

    countries.append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale(d.data.continent))
      .attr('opacity', 0.7)
      .attr('stroke', 'white')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#333');
        
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.data.name}</strong> (${d.data.continent})<br>
            Total Cases: ${formatNumber(d.data.value)}<br>
            Total Deaths: ${formatNumber(d.data.deaths)}<br>
            Cases per Million: ${formatNumber(d.data.casesPer1M)}<br>
            Deaths per Million: ${formatNumber(d.data.deathsPer1M)}<br>
            Case Fatality Rate: ${d.data.cfr}%
          `)
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 30) + 'px');
      })
      .on('mouseout', function(d) {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke', 'white');
        
        tooltip.style('opacity', 0);
      });

    // Add country labels for larger rectangles
    countries.append('text')
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 15)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        
        // Only show text for rectangles with sufficient space
        return width > 50 && height > 25 ? d.data.name : '';
      })
      .attr('font-size', '10px')
      .attr('fill', 'black');

    countries.append('text')
      .attr('x', d => d.x0 + 5)
      .attr('y', d => d.y0 + 30)
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        
        // Only show value for rectangles with sufficient space
        return width > 50 && height > 50 ? formatNumber(d.data.value) : '';
      })
      .attr('font-size', '10px')
      .attr('fill', 'black');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(20,${height - 20})`);

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .text('COVID-19 Cases by Continent and Country');

  }, [data]);

  return (
    <ChartContainer>
      <svg ref={svgRef} style={{ maxWidth: '100%' }}></svg>
    </ChartContainer>
  );
};

export default TreeMap;
