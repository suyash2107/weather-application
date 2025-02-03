import React, { useState } from "react";
import axios from "axios";
import styled, { keyframes } from "styled-components";
import { FiSearch, FiMapPin, FiSun, FiWind, FiCloudRain, FiAlertCircle } from "react-icons/fi";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled components
const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  font-family: 'Segoe UI', sans-serif;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  max-width: 600px;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SearchButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #00b4d8, #0077b6);
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 180, 216, 0.4);
  }
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  animation: ${fadeIn} 0.5s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const WeatherHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const WeatherInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

const WeatherItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
`;

const Temperature = styled.div`
  font-size: 3.5rem;
  font-weight: bold;
  margin: 1rem 0;
  position: relative;
  
  &::after {
    content: '°C';
    font-size: 1.5rem;
    position: absolute;
    top: 0;
    right: -1.5rem;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 99, 71, 0.2);
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: ${fadeIn} 0.3s ease;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

// Weather code mapping
const weatherCodes = {
  0: { label: "Clear sky", icon: <FiSun /> },
  1: { label: "Mainly clear", icon: <FiSun /> },
  2: { label: "Partly cloudy", icon: <FiSun /> },
  3: { label: "Overcast", icon: <FiCloudRain /> },
  45: { label: "Fog", icon: <FiCloudRain /> },
  48: { label: "Depositing rime fog", icon: <FiCloudRain /> },
  51: { label: "Light drizzle", icon: <FiCloudRain /> },
  53: { label: "Moderate drizzle", icon: <FiCloudRain /> },
  55: { label: "Dense drizzle", icon: <FiCloudRain /> },
  56: { label: "Light freezing drizzle", icon: <FiCloudRain /> },
  57: { label: "Dense freezing drizzle", icon: <FiCloudRain /> },
  61: { label: "Slight rain", icon: <FiCloudRain /> },
  63: { label: "Moderate rain", icon: <FiCloudRain /> },
  65: { label: "Heavy rain", icon: <FiCloudRain /> },
  66: { label: "Light freezing rain", icon: <FiCloudRain /> },
  67: { label: "Heavy freezing rain", icon: <FiCloudRain /> },
  71: { label: "Slight snow fall", icon: <FiCloudRain /> },
  73: { label: "Moderate snow fall", icon: <FiCloudRain /> },
  75: { label: "Heavy snow fall", icon: <FiCloudRain /> },
  77: { label: "Snow grains", icon: <FiCloudRain /> },
  80: { label: "Slight rain showers", icon: <FiCloudRain /> },
  81: { label: "Moderate rain showers", icon: <FiCloudRain /> },
  82: { label: "Violent rain showers", icon: <FiCloudRain /> },
  85: { label: "Slight snow showers", icon: <FiCloudRain /> },
  86: { label: "Heavy snow showers", icon: <FiCloudRain /> },
  95: { label: "Thunderstorm", icon: <FiCloudRain /> },
  96: { label: "Thunderstorm with hail", icon: <FiCloudRain /> },
  99: { label: "Heavy thunderstorm with hail", icon: <FiCloudRain /> },
};

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geocodeResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
      );

      const location = geocodeResponse.data?.results?.[0];
      if (!location) {
        throw new Error("City not found");
      }

      const { latitude, longitude } = location;
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m`
      );

      const currentWeather = weatherResponse.data?.current_weather;
      if (!currentWeather) {
        throw new Error("Weather data unavailable");
      }

      setWeather({
        ...currentWeather,
        city: location.name,
      });
    } catch (err) {
      setError(err.response?.data?.reason || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        Weather Forecast
      </h1>
      <p style={{ opacity: 0.8 }}>Get real-time weather information</p>

      <SearchContainer>
        <Input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
        />
        <SearchButton onClick={fetchWeather} disabled={loading}>
          {loading ? <Spinner /> : <FiSearch />}
          {loading ? "Searching..." : "Search"}
        </SearchButton>
      </SearchContainer>

      {error && (
        <ErrorMessage>
          <FiAlertCircle />
          {error}
        </ErrorMessage>
      )}

      {weather && (
        <WeatherCard>
          <WeatherHeader>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FiMapPin size={24} />
              <h2 style={{ margin: 0 }}>{weather.city}</h2>
            </div>
            <div style={{ opacity: 0.8 }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </div>
          </WeatherHeader>

          <Temperature>
            {weather.temperature}
          </Temperature>

          <WeatherInfo>
            <WeatherItem>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <FiWind size={20} />
                Wind Speed
              </div>
              <div style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>
                {weather.windspeed} km/h
              </div>
            </WeatherItem>

            <WeatherItem>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                {weatherCodes[weather.weathercode]?.icon || <FiSun />}
                Condition
              </div>
              <div style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}>
                {weatherCodes[weather.weathercode]?.label || "N/A"}
              </div>
            </WeatherItem>
          </WeatherInfo>
        </WeatherCard>
      )}
    </Container>
  );
};

export default WeatherApp;