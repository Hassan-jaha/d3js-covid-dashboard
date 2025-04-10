import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const Description = styled.p`
  margin-bottom: 30px;
  line-height: 1.6;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const Card = styled(Link)`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  margin-top: 0;
  color: #2c3e50;
`;

const CardDescription = styled.p`
  color: #7f8c8d;
`;

const chartTypes = [
  { 
    path: '/bar-chart', 
    name: 'Bar Chart', 
    description: 'Compare values across different categories' 
  },
  { 
    path: '/line-chart', 
    name: 'Line Chart', 
    description: 'Show trends over time or continuous data' 
  },
  { 
    path: '/pie-chart', 
    name: 'Pie Chart', 
    description: 'Display proportions of different categories' 
  },
  { 
    path: '/scatter-plot', 
    name: 'Scatter Plot', 
    description: 'Show relationship between two variables' 
  },
  { 
    path: '/area-chart', 
    name: 'Area Chart', 
    description: 'Display cumulative totals over time' 
  },
  { 
    path: '/bubble-chart', 
    name: 'Bubble Chart', 
    description: 'Compare three dimensions of data' 
  },
  { 
    path: '/heatmap', 
    name: 'Heat Map', 
    description: 'Show intensity of values with colors' 
  },
  { 
    path: '/treemap', 
    name: 'Tree Map', 
    description: 'Hierarchical data with nested rectangles' 
  }
];

const Home = () => {
  return (
    <Container>
      <Title>COVID-19 Data Visualization Dashboard</Title>
      <Description>
        Explore COVID-19 data visualizations built with D3.js using the dataset from Our World in Data. 
        This dashboard showcases various chart types that help in understanding 
        and analyzing patterns in COVID-19 data globally.
      </Description>
      
      <CardsContainer>
        {chartTypes.map((chart, index) => (
          <Card key={index} to={chart.path}>
            <CardTitle>{chart.name}</CardTitle>
            <CardDescription>{chart.description}</CardDescription>
          </Card>
        ))}
      </CardsContainer>
    </Container>
  );
};

export default Home;
