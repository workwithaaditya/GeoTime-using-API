// Target the navbar search form and input
const searchForm = document.querySelector('form[role="search"]');
const searchInput = searchForm.querySelector('input[type="search"]');
const loadingElement = document.getElementById('loading');

// API Configuration
const API_KEY = '8bee34e197msh6f107bb89434ed3p109bb6jsn654f791faa2f';
const API_HOST = 'weatherapi-com.p.rapidapi.com';

// Function to get user's current location using Geolocation API
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log(`📍 Current Location: Lat ${latitude}, Lng ${longitude}`);
          
          // Fetch weather for coordinates (works as city parameter)
          const loc = `${latitude},${longitude}`;
          try { localStorage.setItem('lastLocation', loc); } catch {}
          resolve(loc);
        },
        (error) => {
          console.warn('⚠️ Geolocation error:', error.message);
          // Prefer last known location if available
          try {
            const cached = localStorage.getItem('lastLocation');
            if (cached) {
              console.log('📍 Using last known location from cache:', cached);
              resolve(cached);
              return;
            }
          } catch {}
          console.log('📍 Using default location: Delhi');
          resolve('Delhi');
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.warn('❌ Geolocation not supported, using default location');
      try {
        const cached = localStorage.getItem('lastLocation');
        if (cached) return resolve(cached);
      } catch {}
      resolve('Delhi');
    }
  });
}

// Function to show/hide loading indicator
function showLoading(show) {
  if (show) {
    loadingElement.classList.add('active');
  } else {
    loadingElement.classList.remove('active');
  }
}

// Function to get AQI level description
function getAQIDescription(index) {
  const descriptions = {
    1: { level: 'Good', desc: 'Air quality is satisfactory and poses little or no risk', color: '#00e400' },
    2: { level: 'Moderate', desc: 'Air quality is acceptable for most people', color: '#ffff00' },
    3: { level: 'Unhealthy for Sensitive Groups', desc: 'Sensitive groups may experience health effects', color: '#ff7e00' },
    4: { level: 'Unhealthy', desc: 'Everyone may begin to experience health effects', color: '#ff0000' },
    5: { level: 'Very Unhealthy', desc: 'Health alert: everyone may experience serious health effects', color: '#8f3f97' },
    6: { level: 'Hazardous', desc: 'Health warnings of emergency conditions', color: '#7e0023' }
  };
  return descriptions[index] || { level: 'Unknown', desc: 'No data available', color: '#999' };
}

/**
 * Map weather condition text to shader effect type
 * Used by shader-effects.js to select appropriate WebGL effect
 * @param {string} condition - Weather condition text from API
 * @returns {string} Shader effect type
 */
function mapWeatherCondition(condition) {
  const cond = condition.toLowerCase();
  
  // Thunderstorm & Lightning
  if (cond.includes('thunder') || cond.includes('lightning')) return 'thunderstorm';
  
  // Rain & Drizzle
  if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return 'rain';
  
  // Snow & Sleet
  if (cond.includes('snow') || cond.includes('sleet') || cond.includes('blizzard')) return 'snow';
  
  // Mist & Fog
  if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze')) return 'mist';
  
  // Clouds
  if (cond.includes('cloud') || cond.includes('overcast')) return 'clouds';
  
  // Clear (default)
  return 'clear';
}


// Function to fetch comprehensive weather data
async function getWeatherData(city) {
  const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${encodeURIComponent(city)}&days=3&aqi=yes&alerts=yes`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST
    }
  };

  try {
    showLoading(true);
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather Data:', data);

    // Update all sections
    updateCurrentWeather(data);
    updateForecast(data);
    updateHourlyForecast(data);
    updateAstronomy(data);
    updateAirQuality(data);
    updateAlerts(data);

    showLoading(false);
  } catch (error) {
    console.error('Error fetching weather:', error);
    alert(`Failed to fetch weather data: ${error.message}\nPlease check your internet connection and try again.`);
    document.querySelector("#cityName").textContent = "⚠️ Error loading data";
    showLoading(false);
  }
}

// Update current weather display
function updateCurrentWeather(data) {
  if (!data || !data.location || !data.current) {
    console.error('Invalid weather data');
    return;
  }
  
  const { location, current } = data;

  // Cache last successful location (lat,lon) for future default loads
  try {
    if (typeof location.lat === 'number' && typeof location.lon === 'number') {
      localStorage.setItem('lastLocation', `${location.lat},${location.lon}`);
      localStorage.setItem('lastCityName', location.name || '');
    }
  } catch {}
  
  document.getElementById('cityName').textContent = location.name || 'Unknown';
  document.getElementById('region').textContent = location.region || '--';
  document.getElementById('country').textContent = location.country || '--';
  document.getElementById('temperature').textContent = `${Math.round(current.temp_c)}°C`;
  document.getElementById('condition').textContent = current.condition.text || '--';
  
  const weatherIcon = document.getElementById('weatherIcon');
  weatherIcon.src = current.condition.icon.startsWith('//') ? `https:${current.condition.icon}` : current.condition.icon;
  weatherIcon.alt = current.condition.text;
  weatherIcon.style.display = 'block';
  
  // 🎨 Initialize shader effect based on weather condition
  if (window.WeatherShader) {
    const weatherType = mapWeatherCondition(current.condition.text);
    const isDay = current.is_day === 1;
    window.WeatherShader.initialize(weatherType, isDay);
  }
  
  document.getElementById('feelsLike').textContent = `${Math.round(current.feelslike_c)}°C`;
  document.getElementById('windSpeed').textContent = `${current.wind_kph} km/h ${current.wind_dir}`;
  document.getElementById('humidity').textContent = `${current.humidity}%`;
  document.getElementById('visibility').textContent = `${current.vis_km} km`;
  document.getElementById('pressure').textContent = `${current.pressure_mb} mb`;
  document.getElementById('uvIndex').textContent = current.uv;
  document.getElementById('lastUpdated').textContent = current.last_updated;
}

// Update 3-day forecast
function updateForecast(data) {
  if (!data || !data.forecast || !data.forecast.forecastday) {
    console.error('Invalid forecast data');
    return;
  }
  
  const forecastContainer = document.getElementById('forecastContainer');
  forecastContainer.innerHTML = '';

  data.forecast.forecastday.forEach((day, index) => {
    const date = new Date(day.date);
    const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const iconUrl = day.day.condition.icon.startsWith('//') ? `https:${day.day.condition.icon}` : day.day.condition.icon;
    
    const card = `
      <div class="col mb-4">
        <div class="card weather-card">
          <div class="card-header">
            <h4><i class="fas fa-calendar-day me-2"></i>${dayName}</h4>
          </div>
          <div class="card-body text-center">
            <p style="color: rgba(255,255,255,0.7); margin: 0;">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            <img src="${iconUrl}" alt="${day.day.condition.text}" style="width: 80px; filter: drop-shadow(0 0 8px rgba(255,255,255,0.3));">
            <h3 style="color: #ffd700; margin: 10px 0;">${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</h3>
            <p style="color: #fff; font-weight: 500;">${day.day.condition.text}</p>
            <div class="row text-start mt-3">
              <div class="col-6 mb-2">
                <small style="color: rgba(255,255,255,0.7);"><i class="fas fa-cloud-rain me-1"></i>Rain</small>
                <p style="color: #fff; margin: 0; font-size: 0.9rem;">${day.day.daily_chance_of_rain}%</p>
              </div>
              <div class="col-6 mb-2">
                <small style="color: rgba(255,255,255,0.7);"><i class="fas fa-wind me-1"></i>Wind</small>
                <p style="color: #fff; margin: 0; font-size: 0.9rem;">${Math.round(day.day.maxwind_kph)} km/h</p>
              </div>
              <div class="col-6 mb-2">
                <small style="color: rgba(255,255,255,0.7);"><i class="fas fa-tint me-1"></i>Humidity</small>
                <p style="color: #fff; margin: 0; font-size: 0.9rem;">${day.day.avghumidity}%</p>
              </div>
              <div class="col-6 mb-2">
                <small style="color: rgba(255,255,255,0.7);"><i class="fas fa-sun me-1"></i>UV</small>
                <p style="color: #fff; margin: 0; font-size: 0.9rem;">${day.day.uv}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    forecastContainer.innerHTML += card;
  });
}

// Update hourly forecast (next 12 hours from today)
function updateHourlyForecast(data) {
  if (!data || !data.forecast || !data.forecast.forecastday || !data.forecast.forecastday[0]) {
    console.error('Invalid hourly forecast data');
    return;
  }
  
  const hourlyContainer = document.getElementById('hourlyForecast');
  hourlyContainer.innerHTML = '';

  const currentHour = new Date().getHours();
  const todayHours = data.forecast.forecastday[0].hour || [];
  
  // Get next 12 hours (or remaining hours if less than 12)
  const hours = todayHours.slice(currentHour, Math.min(currentHour + 12, 24));

  if (hours.length === 0) {
    hourlyContainer.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hourly data available</td></tr>';
    return;
  }

  hours.forEach(hour => {
    const time = new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    const iconUrl = hour.condition.icon.startsWith('//') ? `https:${hour.condition.icon}` : hour.condition.icon;
    
    const row = `
      <tr>
        <td><strong>${time}</strong></td>
        <td>
          <img src="${iconUrl}" alt="${hour.condition.text}" style="width: 40px; vertical-align: middle;">
          ${hour.condition.text}
        </td>
        <td><strong>${Math.round(hour.temp_c)}°C</strong></td>
        <td>${hour.chance_of_rain}%</td>
        <td>${Math.round(hour.wind_kph)} km/h</td>
        <td>${hour.humidity}%</td>
      </tr>
    `;
    hourlyContainer.innerHTML += row;
  });
}

// Update astronomy data
function updateAstronomy(data) {
  if (!data || !data.forecast || !data.forecast.forecastday || !data.forecast.forecastday[0]) {
    console.error('Invalid astronomy data');
    return;
  }
  
  const astro = data.forecast.forecastday[0].astro;
  
  document.getElementById('sunrise').textContent = astro.sunrise || '--';
  document.getElementById('sunset').textContent = astro.sunset || '--';
  document.getElementById('sunStatus').textContent = astro.is_sun_up === 1 ? 'Sun is Up' : 'Sun is Down';
  document.getElementById('moonrise').textContent = astro.moonrise || '--';
  document.getElementById('moonset').textContent = astro.moonset || '--';
  document.getElementById('moonPhase').textContent = astro.moon_phase || '--';
  document.getElementById('moonIllumination').textContent = `${astro.moon_illumination || 0}%`;
}

// Update air quality data
function updateAirQuality(data) {
  if (!data || !data.current) {
    console.error('Invalid current data for AQI');
    return;
  }
  
  const aqi = data.current.air_quality;
  
  if (aqi && aqi['us-epa-index']) {
    const aqiInfo = getAQIDescription(aqi['us-epa-index']);
    
    document.getElementById('aqiLevel').textContent = aqiInfo.level;
    document.getElementById('aqiLevel').style.color = aqiInfo.color;
    document.getElementById('aqiDescription').textContent = aqiInfo.desc;
    
    document.getElementById('co').textContent = (aqi.co || 0).toFixed(1);
    document.getElementById('o3').textContent = (aqi.o3 || 0).toFixed(1);
    document.getElementById('no2').textContent = (aqi.no2 || 0).toFixed(1);
    document.getElementById('so2').textContent = (aqi.so2 || 0).toFixed(1);
    document.getElementById('pm25').textContent = (aqi.pm2_5 || 0).toFixed(1);
    document.getElementById('pm10').textContent = (aqi.pm10 || 0).toFixed(1);
  } else {
    document.getElementById('aqiLevel').textContent = 'N/A';
    document.getElementById('aqiDescription').textContent = 'Air quality data not available for this location';
  }
}

// Update weather alerts
function updateAlerts(data) {
  const alertsSection = document.getElementById('alerts');
  const alertsContainer = document.getElementById('alertsContainer');
  
  if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
    alertsSection.style.display = 'block';
    alertsContainer.innerHTML = '';
    
    data.alerts.alert.forEach(alert => {
      const alertCard = `
        <div class="card weather-card mb-3">
          <div class="card-header" style="background: linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(255, 100, 0, 0.3));">
            <h4><i class="fas fa-exclamation-triangle me-2"></i>${alert.event}</h4>
          </div>
          <div class="card-body">
            <p style="color: #fff;"><strong>Headline:</strong> ${alert.headline}</p>
            <p style="color: rgba(255,255,255,0.8);"><strong>Severity:</strong> ${alert.severity} | <strong>Urgency:</strong> ${alert.urgency}</p>
            <p style="color: rgba(255,255,255,0.8);"><strong>Areas:</strong> ${alert.areas}</p>
            <p style="color: rgba(255,255,255,0.8);"><strong>Effective:</strong> ${new Date(alert.effective).toLocaleString()}</p>
            <p style="color: rgba(255,255,255,0.8);"><strong>Expires:</strong> ${new Date(alert.expires).toLocaleString()}</p>
            <p style="color: rgba(255,255,255,0.9); margin-top: 1rem;">${alert.desc}</p>
          </div>
        </div>
      `;
      alertsContainer.innerHTML += alertCard;
    });
  } else {
    alertsSection.style.display = 'none';
  }
}

// Listen for submit event on navbar search form
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = searchInput.value.trim();
  if (city) {
    getWeatherData(city);
    searchInput.value = '';
  } else {
    document.querySelector("#cityName").textContent = "⚠️ Enter a city name";
  }
});

// ============ ANIMATION HELPERS ============

/**
 * Add fade-in animation to elements
 */
function animateElementIn(element, delay = 0) {
  if (!element) return;
  element.style.animation = `fadeInUp 0.6s ease forwards`;
  element.style.animationDelay = `${delay}ms`;
}

/**
 * Add staggered animations to list items
 */
function staggerAnimateListItems(container) {
  if (!container) return;
  const items = container.querySelectorAll('li');
  items.forEach((item, index) => {
    item.style.animation = `fadeInSlide 0.5s ease forwards`;
    item.style.animationDelay = `${(index + 1) * 100}ms`;
  });
}

/**
 * Add loading shimmer effect
 */
function addLoadingEffect(element) {
  if (!element) return;
  element.classList.add('loading');
}

/**
 * Remove loading shimmer effect
 */
function removeLoadingEffect(element) {
  if (!element) return;
  element.classList.remove('loading');
}

/**
 * Animate value changes with smooth transition
 */
function animateValueChange(element, newValue, duration = 1000) {
  if (!element) return;
  
  const oldValue = parseFloat(element.textContent);
  const difference = newValue - oldValue;
  const steps = 60;
  const stepDuration = duration / steps;
  let currentStep = 0;

  const interval = setInterval(() => {
    currentStep++;
    const progress = currentStep / steps;
    const currentValue = oldValue + difference * progress;
    
    if (element.textContent.includes('°')) {
      element.textContent = `${Math.round(currentValue)}°C`;
    } else {
      element.textContent = currentValue.toFixed(1);
    }

    if (currentStep >= steps) {
      clearInterval(interval);
      element.textContent = newValue;
    }
  }, stepDuration);
}

/**
 * Pulse animation for important values
 */
function addPulseEffect(element) {
  if (!element) return;
  element.style.animation = 'pulse 2s ease-in-out infinite';
}

/**
 * Trigger card entrance animations
 */
function triggerCardAnimations() {
  const cards = document.querySelectorAll('.weather-card');
  cards.forEach((card, index) => {
    removeLoadingEffect(card);
    // Reset animation by removing and re-adding
    card.style.animation = 'none';
    setTimeout(() => {
      if (index === 0) {
        card.style.animation = 'slideInLeft 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
      } else if (index === 1) {
        card.style.animation = 'slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both';
      } else {
        card.style.animation = 'slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both';
      }
    }, 10);
  });

  // Add interactive parallax + sheen after cards are in DOM
  setupInteractiveCards();
}

/**
 * Add a premium parallax tilt + sheen effect that follows the cursor.
 * Removes the old rotating-glass look and replaces with subtle 3D interactivity.
 */
function setupInteractiveCards() {
  const cards = document.querySelectorAll('.weather-card');
  cards.forEach(card => {
    let rafId = null;

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.setProperty('--px', px + '%');
        card.style.setProperty('--py', py + '%');

        const rotateX = ((py - 50) / 50) * -6; // tilt up/down
        const rotateY = ((px - 50) / 50) * 6;  // tilt left/right
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;
        card.classList.add('is-hover');
      });
    }

    function onEnter() {
      // retrigger sheen sweep by toggling class (handled in CSS)
      card.classList.remove('is-hover');
      void card.offsetWidth; // force reflow
      card.classList.add('is-hover');
    }

    function onLeave() {
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transform = '';
      card.classList.remove('is-hover');
    }

    // Clean prior listeners if any (idempotent handling)
    card.removeEventListener('mousemove', onMove);
    card.removeEventListener('mouseenter', onEnter);
    card.removeEventListener('mouseleave', onLeave);

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
  });
}

// ============ ENHANCED WEATHER UPDATES ============

/**
 * Enhanced version of updateCurrentWeather with animations
 */
const originalUpdateCurrentWeather = updateCurrentWeather;
updateCurrentWeather = function(data) {
  originalUpdateCurrentWeather.call(this, data);
  
  // Add animations to important elements
  const tempElement = document.getElementById('temperature');
  if (tempElement) addPulseEffect(tempElement);
  
  // Animate weather icon
  const icon = document.getElementById('weatherIcon');
  if (icon) {
    icon.style.animation = 'slideInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }
};

/**
 * Enhanced version of updateForecast with animations
 */
const originalUpdateForecast = updateForecast;
updateForecast = function(data) {
  originalUpdateForecast.call(this, data);
  triggerCardAnimations();
};

/**
 * Enhanced version of updateHourlyForecast with animations
 */
const originalUpdateHourlyForecast = updateHourlyForecast;
updateHourlyForecast = function(data) {
  originalUpdateHourlyForecast.call(this, data);
  
  // Stagger table rows
  setTimeout(() => {
    const rows = document.querySelectorAll('.table tbody tr');
    rows.forEach((row, index) => {
      row.style.animation = 'none';
      setTimeout(() => {
        row.style.animation = `fadeInUp 0.5s ease forwards`;
        row.style.animationDelay = `${index * 50}ms`;
      }, 10);
    });
  }, 100);
};

/**
 * Enhanced version of updateAstronomy with animations
 */
const originalUpdateAstronomy = updateAstronomy;
updateAstronomy = function(data) {
  originalUpdateAstronomy.call(this, data);
  
  // Stagger list items
  setTimeout(() => {
    const container = document.querySelector('#astronomy .card-body');
    if (container) staggerAnimateListItems(container);
  }, 100);
};

/**
 * Enhanced version of updateAirQuality with animations
 */
const originalUpdateAirQuality = updateAirQuality;
updateAirQuality = function(data) {
  originalUpdateAirQuality.call(this, data);
  
  // Stagger pollutant list items
  setTimeout(() => {
    const container = document.querySelector('#air-quality .card-body');
    if (container) staggerAnimateListItems(container);
  }, 100);
};

// Load weather for user's current location on page load
window.addEventListener('load', async () => {
  console.log('🌍 Fetching user location...');
  const location = await getUserLocation();
  console.log(`📍 Fetching weather for: ${location}`);
  getWeatherData(location);
});

// Current Location button handler
const currentBtn = document.getElementById('btnCurrentLocation');
if (currentBtn) {
  currentBtn.addEventListener('click', async () => {
    currentBtn.disabled = true;
    const prevText = currentBtn.innerHTML;
    currentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
      const loc = await getUserLocation();
      getWeatherData(loc);
    } finally {
      currentBtn.disabled = false;
      currentBtn.innerHTML = prevText;
    }
  });
}

// Add smooth scroll behavior with enhanced animation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Add subtle highlight animation
      target.style.animation = 'pulse 1s ease-in-out';
    }
  });
});
