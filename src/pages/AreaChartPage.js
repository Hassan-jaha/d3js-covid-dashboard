import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AreaChart from '../components/charts/AreaChart';
import { fetchCovidData, getCountryTimeSeries } from '../services/dataService';

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

const SelectContainer = styled.div`
  margin-bottom: 20px;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const AreaChartPage = () => {
  const [data, setData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('United States');
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
        
        // Get list of countries for dropdown
        const countryList = Array.from(new Set(covidData.map(d => d.location)))
          .filter(c => c !== 'World' && c !== 'International' && c !== '')
          .sort();
        setCountries(countryList);
        
        // Get time series for default country
        const countryData = getCountryTimeSeries(covidData, selectedCountry);
        setData(countryData);
      } catch (err) {
        setError(err.message || 'Failed to load COVID data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const updateCountryData = async () => {
      try {
        setLoading(true);
        const covidData = await fetchCovidData();
        const countryData = getCountryTimeSeries(covidData, selectedCountry);
        setData(countryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (countries.length > 0) {
      updateCountryData();
    }
  }, [selectedCountry]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  if (loading) return <Container><p>Loading data...</p></Container>;
  if (error) return <Container><p>Error: {error}</p></Container>;

  return (
    <Container>
      <Title>COVID-19 Area Chart</Title>
      <Description>
        This area chart shows the cumulative COVID-19 cases and deaths over time for the selected country.
      </Description>
      
      <SelectContainer>
        <Select value={selectedCountry} onChange={handleCountryChange}>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </Select>
      </SelectContainer>
      
      <AreaChart data={data} country={selectedCountry} />
    </Container>
  );
};

export default AreaChartPage;
