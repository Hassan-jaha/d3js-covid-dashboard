import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BarChart from '../components/charts/BarChart';
import { fetchCovidData, getTopCountriesByMetric } from '../services/dataService';

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

const ErrorMessage = styled.div`
  padding: 20px;
  background-color: #ffdddd;
  border-left: 6px solid #f44336;
  margin-bottom: 15px;
`;

const Instructions = styled.div`
  background-color: #e7f3fe;
  border-left: 6px solid #2196F3;
  padding: 20px;
`;

const BarChartPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const covidData = await fetchCovidData();
        
        if (!covidData || covidData.length === 0) {
          throw new Error("No data loaded. Please ensure the CSV file is properly placed.");
        }
        
        // Get top 10 countries by total cases
        const topCountries = getTopCountriesByMetric(covidData, 'total_cases', 10);
        setData(topCountries);
      } catch (err) {
        setError(err.message || 'Failed to load COVID data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <Container><p>Loading data...</p></Container>;
  
  if (error) {
    return (
      <Container>
        <ErrorMessage>
          <p>Error: {error}</p>
        </ErrorMessage>
        <Instructions>
          <h3>How to fix this:</h3>
          <ol>
            <li>Ensure the COVID-19 dataset file named <code>owid-covid-data.csv</code> is in the <code>public/data</code> folder</li>
            <li>If the filename is different, update the COVID_DATA_FILENAME constant in src/services/dataService.js</li>
            <li>Restart the application</li>
          </ol>
        </Instructions>
      </Container>
    );
  }

  return (
    <Container>
      <Title>COVID-19 Bar Chart</Title>
      <Description>
        This bar chart shows the top 10 countries by total COVID-19 cases using data from
        Our World in Data.
      </Description>
      <BarChart data={data} />
    </Container>
  );
};

export default BarChartPage;
