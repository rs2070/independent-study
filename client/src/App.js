import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import stateAbbreviations from './states.json';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import placeholderImage from './placeholder.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


function App() {
  const [filters, setFilters] = useState({ location: '', minPrice: '', maxPrice: '', minBathrooms: '', maxBathrooms: '', minBedrooms: '', maxBedrooms: '', minSqft: '', maxSqft: '', propertyType: '', politicalType: '' });
  const [properties, setProperties] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chartData, setChartData] = useState({});
  const [loadedForecasts, setLoadedForecasts] = useState({}); // Add this line to fix the issue
  const [apiCallCount, setApiCallCount] = useState(0);

  const mapFiltersToApiParams = () => ({
    location: filters.location.trim(),
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    bathsMin: filters.minBathrooms ? parseInt(filters.minBathrooms) : undefined,
    bathsMax: filters.maxBathrooms ? parseInt(filters.maxBathrooms) : undefined,
    bedsMin: filters.minBedrooms ? parseInt(filters.minBedrooms) : undefined,
    bedsMax: filters.maxBedrooms ? parseInt(filters.maxBedrooms) : undefined,
    sqftMin: filters.minSqft ? parseInt(filters.minSqft) : undefined,
    sqftMax: filters.maxSqft ? parseInt(filters.maxSqft) : undefined,
    home_type: filters.propertyType,
    status_type: "ForSale"
});



  const updateUserPreferences = async (userId, key, value) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/properties/update-preferences`, { userId, key, value });
      console.log("Server response:", response.data);
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    updateUserPreferences(1, name, value);  // Reintegrated
  };

  const handleSearch = async () => {
    if (apiCallCount >= 90) {
        alert('API call limit nearing capacity. Further searches are disabled to prevent extra charges.');
        return;
    }

    const locationParts = filters.location.split(',');
    if (locationParts.length < 2) {
        console.error('Location input must include both city and state separated by a comma.');
        return;
    }

    const city = locationParts[0].trim();
    const stateAbbreviation = locationParts[1].trim();
    const county = await fetchCounty(city, stateAbbreviation);

    if (!county) {
        console.error('Unable to fetch county for given city and state.');
        return;
    }

    const politicalAffiliation = await fetchPoliticalData(stateAbbreviation, county);
    if (!politicalAffiliation) {
        console.error('Unable to fetch political data for the given location.');
        return;
    }

    const params = mapFiltersToApiParams();
    try {
        const response = await axios.get('http://localhost:5001/api/properties/search', { params });
        if (response.data && response.data.props && Array.isArray(response.data.props)) {
            const propertiesWithPoliticalData = response.data.props.map(property => ({
                ...property,
                politicalAffiliation: politicalAffiliation // Add political affiliation directly to each property
            }));
            setProperties(propertiesWithPoliticalData);
        } else {
            console.error('Expected an array of properties, received:', response.data);
            // Optionally set an error state or message here
        }
        setApiCallCount(calls => calls + 1);
    } catch (error) {
        console.error('Failed to fetch properties:', error.response ? error.response.data : error.message);
    }
};



const loadHistoricalData = useCallback(async () => {
  if (properties[currentIndex] && properties[currentIndex].zpid) {
    const zpid = properties[currentIndex].zpid;
    if (!loadedForecasts[zpid]) {
      try {
        const response = await axios.get(`http://localhost:5001/api/zestimatehistory?zpid=${zpid}`);
        if (response.data && Array.isArray(response.data)) {
          const historicalData = response.data.map(item => ({
            t: new Date(item.t * 1000),
            v: item.v
          }));
          setLoadedForecasts(prev => ({
            ...prev,
            [zpid]: { historical: historicalData, forecasts: {} }
          }));
          setChartData(formatChartData(historicalData));
        }
      } catch (error) {
        console.error("Failed to load zestimate history:", error);
      }
    } else {
      setChartData(formatChartData(loadedForecasts[zpid].historical));
    }
  }
}, [currentIndex, properties, loadedForecasts]);

/*  useEffect(() => {
    loadHistoricalData();
  }, [currentIndex, properties, loadHistoricalData]);*/


  const handleForecast = async (years) => {
    const zpid = properties[currentIndex].zpid.toString();
    const periods = { 5: 60, 10: 120, 20: 240 }[years];

    if (properties[currentIndex] && properties[currentIndex].zpid && periods) {
      if (loadedForecasts[zpid] && loadedForecasts[zpid].forecasts[periods]) {
        setChartData(formatChartData([...loadedForecasts[zpid].historical, ...loadedForecasts[zpid].forecasts[periods]]));
      } else {
        try {
          const response = await axios.get(`http://localhost:5001/api/forecast/${zpid}/${periods}`);
          if (response.data && response.data.forecast) {
            const forecastData = response.data.forecast.map(item => ({
              t: new Date(item.date),
              v: item.value
            }));
            setLoadedForecasts(prev => ({
              ...prev,
              [zpid]: {
                ...prev[zpid],
                forecasts: { ...prev[zpid].forecasts, [periods]: forecastData }
              }
            }));
            setChartData(formatChartData([...loadedForecasts[zpid].historical, ...forecastData]));
          }
        } catch (error) {
          console.error("Error fetching forecast data:", error);
        }
      }
    }
  };


  function formatChartData(data) {
    return {
      labels: data.map(item => item.t.toLocaleDateString()),
      datasets: [{
        label: 'Zestimate Value Over Time',
        data: data.map(item => item.v),
        borderColor: 'blue',
        backgroundColor: 'rgba(135, 206, 250, 0.2)',
        fill: false,
      }],
    };
  }


  // Rest of the code remains unchanged...

  const fetchCounty = async (city, state) => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/millbj92/US-Zip-Codes-JSON/refs/heads/master/USCities.json');
      const cities = await response.json();
      const cityData = cities.find(c => c.city === city && c.state === state);
      console.log("Fetched County:", cityData ? cityData.county : "Not Found");
      return cityData ? cityData.county : null;
    } catch (error) {
      console.error('Failed to fetch county data:', error);
      return null;
    }
  };

  const fetchPoliticalData = async (stateAbbreviation, county) => {
    const stateSlug = stateAbbreviations[stateAbbreviation.toUpperCase()];
    console.log(stateSlug)
    const url = `https://static01.nyt.com/elections-assets/2020/data/api/2020-11-03/race-page/${stateSlug}/president.json`;
    try {
      const response = await axios.get(url);
      const races = response.data.data.races;
      if (races.length === 0) {
        console.log('No races found for this state:', stateSlug);
        return 'No political data available.';
      }
      const countyData = races[0].counties.find(c => c.name.toLowerCase() === county.toLowerCase());
      if (countyData) {
        const demVotes = countyData.results.bidenj;
        const repVotes = countyData.results.trumpd;
        const demPercent = ((demVotes / countyData.votes) * 100).toFixed(2);
        const repPercent = ((repVotes / countyData.votes) * 100).toFixed(2);
        if (demPercent > repPercent) {
          return `Democrat`;
        } else if (demPercent < repPercent) {
          return `Republican`;
        } else {
          return `Split`; // This handles an exact tie between votes.
        }
      } else {
        console.log("NYT Data for County: No data found for", county);
        return 'No political data available.';
      }
    } catch (error) {
      console.error('Failed to fetch political data:', error);
      return 'Failed to fetch political data.';
    }
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % properties.length);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + properties.length) % properties.length);
  };


  useEffect(() => {
    if (properties.length && properties[currentIndex]) {
      console.log("Current property zpid:", properties[currentIndex].zpid);
    }
  }, [currentIndex, properties]);
  
  
  // Ensure loadHistoricalData is included in the useEffect dependency array
  useEffect(() => {
    loadHistoricalData();
  
    const selectiveLoadKeys = ['location', 'propertyType', 'politicalType']; // Only load these from local storage
    const alwaysResetKeys = ['minPrice', 'maxPrice', 'minBathrooms', 'maxBathrooms', 'minBedrooms', 'maxBedrooms', 'minSqft', 'maxSqft']; // Always reset these
  
    const loadedFilters = selectiveLoadKeys.reduce((acc, key) => {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        acc[key] = storedValue;
      }
      return acc;
    }, {});
  
    // Set default values for always reset keys
    alwaysResetKeys.forEach(key => {
      loadedFilters[key] = ''; // Set to empty string or any other default value you prefer
    });
  
    setFilters(prevFilters => ({ ...prevFilters, ...loadedFilters }));
  }, [loadHistoricalData]); // Dependencies are adjusted accordingly
    

  return (
    <div className="App">
      <h1>myPropertyApp</h1>
      <input type="text" placeholder="Enter Location (e.g., Los Angeles, CA)" name="location" value={filters.location} onChange={handleFilterChange} />
      {["minPrice", "maxPrice", "minBathrooms", "maxBathrooms", "minBedrooms", "maxBedrooms", "minSqft", "maxSqft"].map(field => (
        <input key={field} type="number" placeholder={field.charAt(0).toUpperCase() + field.slice(1)} name={field} onChange={handleFilterChange} />
      ))}
      <select name="propertyType" onChange={handleFilterChange} value={filters.propertyType}>
        <option value="">Select Type</option>
        <option value="Townhomes">Townhomes</option>
        <option value="Houses">Houses</option>
        <option value="Apartments">Apartments</option>
        <option value="Condos">Condos</option>
        <option value="Apartments_Condos_Co-ops">Apartments/Condos/Co-ops</option>
        <option value="Multi-family">Multi-family</option>
        <option value="Manufactured">Manufactured</option>
        <option value="LotsLand">Lots/Land</option>
      </select>
      <select name="politicalType" onChange={handleFilterChange} value={filters.politicalType}>
        <option value="">Select Political Type</option>
        <option value="Democrat">Democratic</option>
        <option value="Republican">Republican</option>
      </select>
      <button className="search-button" onClick={handleSearch} disabled={apiCallCount >= 90}></button>


      <div className="card-container">
        {properties.length > 0 && (
          <>
            <div className="property-card">
<button className="prev" onClick={handlePrev} disabled={currentIndex === 0}></button>
<button className="next" onClick={handleNext} disabled={currentIndex === properties.length - 1}></button>

              <p>{properties[currentIndex].address}</p>
              <p>{properties[currentIndex].price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
              <p>{properties[currentIndex].bedrooms} BR | {properties[currentIndex].bathrooms} Bath | {properties[currentIndex].livingArea} sqft</p>
              <p className={`political-affiliation ${properties[currentIndex].politicalAffiliation.includes('Democrat') ? 'democrat' : 'republican'}`}>
    {properties[currentIndex].politicalAffiliation}
  </p>
  <p className={`property-type ${properties[currentIndex].propertyType.replace(/\s+/g, '-').toLowerCase()}`}>
  {properties[currentIndex].propertyType === 'Apartments_Condos_Co-ops' ? 'Apartments/Condos/Co-ops' :
   properties[currentIndex].propertyType === 'LotsLand' ? 'Lots/Land' :
   properties[currentIndex].propertyType}
</p>
<img src={properties[currentIndex].imgSrc || placeholderImage} alt="Property" />

{chartData && chartData.datasets && chartData.datasets.length > 0 ? (
  <Line data={chartData} options={{
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
          align: 'center'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)'
        }
      }
    },
    elements: {
      point: {
        radius: 0 // Hide points
      }
    },
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    }
  }} />
) : (
  <p>No chart data available</p>
)}

                          <div className="chart-buttons">
      <button className="chart-button" onClick={loadHistoricalData}></button>
      <button className="chart-button" onClick={() => handleForecast(5)}></button>
          <button className="chart-button" onClick={() => handleForecast(10)}></button>
          <button className="chart-button" onClick={() => handleForecast(20)}></button>
    </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default App;
