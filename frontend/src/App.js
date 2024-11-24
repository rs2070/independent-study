import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('');
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState('');

  const fetchProperties = async (location) => {
    try {
      const response = await axios.get('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
        params: { location },
        headers: {
          'x-rapidapi-key': '455fe49fd9mshf2aa11941a0b9bep1a9583jsn2fb1854349f0',
          'x-rapidapi-host': 'zillow-com1.p.rapidapi.com'
        }
      });
      return response.data.props || [];
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setError('Failed to fetch properties. Please try again.');
      return [];
    }
  };

  const fetchCities = async (longitude, latitude, radius) => {
    try {
      const response = await axios.get(`https://api.geoapify.com/v1/geocode/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          radius: radius * 1609, // radius in meters
          apiKey: 'cdaa95e5cd75450497e41a13dc9b619f'
        }
      });
      return response.data.features.map(feature => feature.properties.city);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setError('Failed to determine cities within radius. Please try again.');
      return [];
    }
  };

  const handleSearch = async () => {
    if (!zipCode) {
      setError('Please enter a ZIP code.');
      return;
    }

    setProperties([]);
    setError('');

    try {
      const locationResponse = await axios.get(`https://api.zippopotam.us/us/${zipCode}`);
      const { longitude, latitude } = locationResponse.data.places[0];
      if (radius) {
        const cities = await fetchCities(longitude, latitude, radius);
        for (const city of cities) {
          const cityProperties = await fetchProperties(city);
          setProperties(prevProperties => [...prevProperties, ...cityProperties]);
        }
      } else {
        const city = locationResponse.data.places[0]['place name'];
        const cityProperties = await fetchProperties(city);
        setProperties(cityProperties);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please check the input or try again later.');
    }
  };

  return (
    <div className="App">
      <h1>Property Finder</h1>
      <input type="text" value={zipCode} onChange={e => setZipCode(e.target.value)} placeholder="Enter ZIP code" />
      <select value={radius} onChange={e => setRadius(e.target.value)}>
        <option value="">Select radius (miles)</option>
        <option value="5">5 miles</option>
        <option value="10">10 miles</option>
        <option value="25">25 miles</option>
        <option value="100">100 miles</option>
      </select>
      <button onClick={handleSearch}>Search</button>
      {properties.length > 0 && (
        <div>
          {properties.map((prop, index) => (
            <div key={index}>
              <h4>{prop.address}</h4>
              <p>Price: {prop.price}</p>
              <p>Bedrooms: {prop.bedrooms}</p>
              <p>Bathrooms: {prop.bathrooms}</p>
              <img src={prop.imgSrc} alt="Property" style={{ width: '100px', height: '100px' }} />
            </div>
          ))}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;
