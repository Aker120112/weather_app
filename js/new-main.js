// js/new-main.js
// Script to fetch and display weather data in the new dashboard UI


const apiKey = "1e3e8f230b6064d27976e41163a82b77";
let currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
let lastCity = null;

// Utility: Format date/time
function formatDateTime(date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${day}, ${hour12}:${minutes} ${ampm}`;
}

// Get geolocation and fetch weather
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      // Get city name
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
      const geoData = await geoRes.json();
      const city = geoData[0]?.name || "Unknown";
      lastCity = city;
      fetchWeather(city);
    }, () => {
      // Default to London if location denied
      lastCity = "London";
      fetchWeather("London");
    });
  } else {
    lastCity = "London";
    fetchWeather("London");
  }
}

// Fetch weather data for a city
async function fetchWeather(city) {
  try {
    // Current weather
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${currentUnit}`);
    const data = await res.json();
    // Forecast
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${currentUnit}`);
    const forecastData = await forecastRes.json();
    updateDashboard(data, forecastData);
  } catch (err) {
    alert("Failed to fetch weather data.");
  }
}

// Update UI
function updateDashboard(current, forecast) {
  // Set live background based on weather
  setLiveBackground(current.weather[0].main);
// Set body class for live background
function setLiveBackground(main) {
  const bgMap = {
    clear: 'bg-clear',
    rain: 'bg-rain',
    snow: 'bg-snow',
    clouds: 'bg-clouds',
    mist: 'bg-mist',
    fog: 'bg-fog',
    haze: 'bg-haze',
  };
  const key = main.toLowerCase();
  const bgClass = bgMap[key] || 'bg-clear';
  document.body.className = bgClass;
}
  // Location & Date/Time
  document.getElementById("city").textContent = current.name;
  document.getElementById("datetime").textContent = formatDateTime(new Date());
  // Main weather Lottie animation
  renderLottieWeather(current.weather[0].main);
  const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
  document.getElementById("temperature").textContent = Math.round(current.main.temp) + tempUnit;
  document.getElementById("weather-description").textContent = current.weather[0].description;
  document.getElementById("humidity").textContent = current.main.humidity + "%";
  const windUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
  document.getElementById("wind").textContent = Math.round(current.wind.speed) + ` ${windUnit}`;
  // Hourly forecast (next 6 hours)
  const hourly = forecast.list.slice(0, 6);
  const hourlyContainer = document.getElementById("hourly-forecast");
  hourlyContainer.innerHTML = "";
  hourly.forEach(item => {
    const date = new Date(item.dt * 1000);
    const hour = date.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <div class=\"hour\">${hour12}${ampm}</div>
      <img src="${getWeatherIcon(item.weather[0].main)}" alt="icon" />
      <div class=\"temp\">${Math.round(item.main.temp)}${tempUnit}</div>
    `;
    hourlyContainer.appendChild(card);
  });
  // Daily forecast (next 5 days)
  const dailyMap = {};
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString(undefined, { weekday: 'short' });
    if (!dailyMap[day]) {
      dailyMap[day] = item;
    }
  });
  const dailyContainer = document.getElementById("daily-forecast");
  dailyContainer.innerHTML = "";
  Object.keys(dailyMap).slice(0, 5).forEach(day => {
    const item = dailyMap[day];
    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <div class=\"day\">${day}</div>
      <img src="${getWeatherIcon(item.weather[0].main)}" alt="icon" />
      <div class=\"temp\">${Math.round(item.main.temp)}${tempUnit}</div>
    `;
    dailyContainer.appendChild(card);
  });
  // Update unit toggle button state
  document.getElementById('celsius-btn').classList.toggle('active', currentUnit === 'metric');
  document.getElementById('fahrenheit-btn').classList.toggle('active', currentUnit === 'imperial');
}
// Render Lottie weather animation in main card
function renderLottieWeather(main) {
  const lottieMap = {
    clear: 'https://assets10.lottiefiles.com/packages/lf20_jmBauI.json', // sun
    rain: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // rain
    snow: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // snow (use rain as placeholder)
    clouds: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // clouds (use rain as placeholder)
    mist: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // mist (use rain as placeholder)
    fog: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // fog (use rain as placeholder)
    haze: 'https://assets2.lottiefiles.com/packages/lf20_Stdaec.json', // haze (use rain as placeholder)
  };
  const key = main.toLowerCase();
  const url = lottieMap[key] || lottieMap['clear'];
  const container = document.getElementById('main-weather-lottie');
  container.innerHTML = '';
  lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: url
  });
}

// Map weather condition to icon
function getWeatherIcon(main) {
  switch (main.toLowerCase()) {
    case "rain": return "img/rain.png";
    case "clear": return "img/sun.png";
    case "snow": return "img/snow.png";
    case "clouds": return "img/cloud.png";
    case "mist":
    case "fog": return "img/mist.png";
    case "haze": return "img/haze.png";
    default: return "img/sun.png";
  }
}

// Unit toggle event listeners
window.addEventListener('DOMContentLoaded', () => {
  getWeatherByLocation();
  document.getElementById('celsius-btn').addEventListener('click', () => {
    if (currentUnit !== 'metric') {
      currentUnit = 'metric';
      if (lastCity) fetchWeather(lastCity);
    }
  });
  document.getElementById('fahrenheit-btn').addEventListener('click', () => {
    if (currentUnit !== 'imperial') {
      currentUnit = 'imperial';
      if (lastCity) fetchWeather(lastCity);
    }
  });
});
