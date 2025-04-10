import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TreeMap from '../components/charts/TreeMap';
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

const TreeMapPage = () => {
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
      <Title>COVID-19 Treemap</Title>
      <Description>
        This treemap shows the hierarchical structure of COVID-19 cases by continent and country.
        Each rectangle represents a country, with size proportional to the number of cases.
        Countries are grouped by continent, and hover over a country to see detailed information.
      </Description>
      <TreeMap data={data} />
    </Container>
  );
};

export default TreeMapPage;
