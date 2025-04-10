import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ScatterPlot from '../components/charts/ScatterPlot';
import { fetchCovidData, getLatestCountryData } from '../services/dataService';

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

const ScatterPlotPage = () => {
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
        
        const latestData = getLatestCountryData(covidData);
        setData(latestData);
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
  if (error) return <Container><p>Error: {error}</p></Container>;

  return (
    <Container>
      <Title>COVID-19 Cases vs Deaths</Title>
      <Description>
        This scatter plot compares total cases vs. total deaths for different countries.
        Each point represents a country, colored by continent. The axes use logarithmic scales
        to better visualize the relationship across different orders of magnitude.
      </Description>
      <ScatterPlot data={data} />
    </Container>
  );
};

export default ScatterPlotPage;
