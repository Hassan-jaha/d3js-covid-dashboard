import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LineChart from '../components/charts/LineChart';
import { fetchCovidData, getGlobalTimeSeries } from '../services/dataService';

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

const LineChartPage = () => {
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
        
        // Get global time series data
        const timeSeriesData = getGlobalTimeSeries(covidData);
        setData(timeSeriesData);
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
      <Title>COVID-19 Global Trend</Title>
      <Description>
        This line chart displays the global trend of COVID-19 cases and deaths over time.
        The data is sourced from Our World in Data.
      </Description>
      <LineChart data={data} />
    </Container>
  );
};

export default LineChartPage;
