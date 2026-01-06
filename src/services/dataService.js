import * as d3 from 'd3';

const COVID_DATA_FILENAME = 'covid-data.csv';
const COVID_DATA_PATH = `/data/${COVID_DATA_FILENAME}`;

const parseDate = d3.timeParse('%Y-%m-%d');

// ========================
// Fetch & clean data
// ========================
export const fetchCovidData = async () => {
  try {
    const rawData = await d3.csv(COVID_DATA_PATH);

    return rawData
      .map(d => {
        const date = parseDate(d.date);
        if (!date) return null;

        return {
          ...d,
          date,
          location: d.location,
          continent: d.continent,
          total_cases: +d.total_cases || 0,
          new_cases: +d.new_cases || 0,
          total_deaths: +d.total_deaths || 0,
          new_deaths: +d.new_deaths || 0,
          people_vaccinated: +d.people_vaccinated || 0,
          population: +d.population || 0
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error loading COVID data:', error);
    return [];
  }
};

// ========================
// Latest data per country
// ========================
export const getLatestCountryData = (data) => {
  const map = new Map();

  data.forEach(d => {
    if (!map.has(d.location) || d.date > map.get(d.location).date) {
      map.set(d.location, d);
    }
  });

  return Array.from(map.values()).filter(d => d.continent);
};

// ========================
// Top N countries by metric
// ========================
export const getTopCountriesByMetric = (data, metric, n = 10) => {
  return getLatestCountryData(data)
    .filter(d => d[metric] > 0)
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, n);
};

// ========================
// Aggregate by continent
// ========================
export const getDataByContinent = (data) => {
  const grouped = d3.group(
    getLatestCountryData(data),
    d => d.continent
  );

  return Array.from(grouped, ([continent, values]) => ({
    continent,
    total_cases: d3.sum(values, d => d.total_cases),
    total_deaths: d3.sum(values, d => d.total_deaths),
    people_vaccinated: d3.sum(values, d => d.people_vaccinated)
  }));
};

// ========================
// Country time series
// ========================
export const getCountryTimeSeries = (data, country) => {
  return data
    .filter(d => d.location === country)
    .sort((a, b) => a.date - b.date);
};

// ========================
// Global time series
// ========================
export const getGlobalTimeSeries = (data) => {
  const grouped = d3.group(
    data,
    d => d3.timeFormat('%Y-%m-%d')(d.date)
  );

  let totalCases = 0;
  let totalDeaths = 0;

  return Array.from(grouped, ([dateStr, values]) => {
    const newCases = d3.sum(values, d => d.new_cases);
    const newDeaths = d3.sum(values, d => d.new_deaths);

    totalCases += newCases;
    totalDeaths += newDeaths;

    return {
      date: new Date(dateStr),
      new_cases: newCases,
      new_deaths: newDeaths,
      total_cases: totalCases,
      total_deaths: totalDeaths
    };
  }).sort((a, b) => a.date - b.date);
};
