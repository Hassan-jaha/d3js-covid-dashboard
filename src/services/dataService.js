import * as d3 from 'd3';

// Update this constant to match your CSV filename
const COVID_DATA_FILENAME = 'covid-data.csv';
const COVID_DATA_PATH = `/data/${COVID_DATA_FILENAME}`;

// Main function to fetch COVID data
export const fetchCovidData = async () => {
  try {
    const data = await d3.csv(COVID_DATA_PATH);
    return data.map(d => ({
      ...d,
      date: new Date(d.date),
      total_cases: d.total_cases ? +d.total_cases : 0,
      new_cases: d.new_cases ? +d.new_cases : 0,
      total_deaths: d.total_deaths ? +d.total_deaths : 0,
      new_deaths: d.new_deaths ? +d.new_deaths : 0,
      reproduction_rate: d.reproduction_rate ? +d.reproduction_rate : 0,
      icu_patients: d.icu_patients ? +d.icu_patients : 0,
      hosp_patients: d.hosp_patients ? +d.hosp_patients : 0,
      total_vaccinations: d.total_vaccinations ? +d.total_vaccinations : 0,
      people_vaccinated: d.people_vaccinated ? +d.people_vaccinated : 0,
      people_fully_vaccinated: d.people_fully_vaccinated ? +d.people_fully_vaccinated : 0,
      population: d.population ? +d.population : 0
    }));
  } catch (error) {
    console.error("Error loading COVID data:", error);
    return [];
  }
};

// Helper function to get latest data for each country
export const getLatestCountryData = (data) => {
  const countryMap = new Map();
  
  data.forEach(d => {
    if (!countryMap.has(d.location) || new Date(d.date) > new Date(countryMap.get(d.location).date)) {
      countryMap.set(d.location, d);
    }
  });
  
  return Array.from(countryMap.values());
};

// Helper function to get data for top N countries by metric
export const getTopCountriesByMetric = (data, metric, n = 10) => {
  const latestData = getLatestCountryData(data);
  
  return latestData
    .filter(d => d[metric] > 0 && d.continent) // Filter out continents and invalid data
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, n);
};

// Helper function to aggregate data by continent
export const getDataByContinent = (data) => {
  const latestData = getLatestCountryData(data);
  
  // Group by continent
  const continents = d3.group(
    latestData.filter(d => d.continent), // Filter out items without continent
    d => d.continent
  );
  
  // Aggregate metrics for each continent
  return Array.from(continents, ([continent, countries]) => ({
    continent,
    total_cases: d3.sum(countries, d => d.total_cases),
    total_deaths: d3.sum(countries, d => d.total_deaths),
    people_vaccinated: d3.sum(countries, d => d.people_vaccinated)
  }));
};

// Helper function to get time series data for a specific country
export const getCountryTimeSeries = (data, countryName) => {
  return data
    .filter(d => d.location === countryName)
    .sort((a, b) => a.date - b.date);
};

// Helper function to get global time series
export const getGlobalTimeSeries = (data) => {
  // Group by date
  const groupedByDate = d3.group(data, d => d.date.toISOString().split('T')[0]);
  
  // Calculate global totals per date
  return Array.from(groupedByDate, ([dateString, entries]) => ({
    date: new Date(dateString),
    new_cases: d3.sum(entries, d => d.new_cases || 0),
    new_deaths: d3.sum(entries, d => d.new_deaths || 0),
    total_cases: d3.sum(entries, d => d.new_cases || 0),  // We'll accumulate this later
    total_deaths: d3.sum(entries, d => d.new_deaths || 0) // We'll accumulate this later
  }))
  .sort((a, b) => a.date - b.date)
  // Calculate running totals
  .map((entry, i, arr) => {
    if (i > 0) {
      entry.total_cases = arr[i-1].total_cases + entry.new_cases;
      entry.total_deaths = arr[i-1].total_deaths + entry.new_deaths;
    }
    return entry;
  });
};
