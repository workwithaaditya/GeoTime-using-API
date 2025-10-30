# SkyWatch - AI Coding Agent Instructions

## Project Overview
SkyWatch is a single-page weather dashboard app using vanilla JavaScript, Bootstrap 5, and the WeatherAPI.com Forecast API. All code lives in three files: `index.html` (with embedded CSS), `script.js`, and `README.md`.

## Architecture & Data Flow

### Core Pattern: Single API Call, Multiple Updates
- **One fetch** to `forecast.json?days=3&aqi=yes&alerts=yes` populates ALL sections
- The response contains: `location`, `current`, `forecast.forecastday[]`, `alerts.alert[]`
- Six update functions consume this data: `updateCurrentWeather()`, `updateForecast()`, `updateHourlyForecast()`, `updateAstronomy()`, `updateAirQuality()`, `updateAlerts()`

### Key File Responsibilities
- **`index.html`**: All CSS embedded in `<style>` tag (lines 12-533), semantic HTML sections with IDs for JavaScript targeting
- **`script.js`**: Fetch logic, DOM manipulation, no frameworks/libraries beyond vanilla JS

## Critical Code Patterns

### 1. Glassmorphism UI (Primary Design Language)
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```
**Apply this to ALL new card/container elements.** Standard gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### 2. Icon URL Handling (Critical Bug Prevention)
WeatherAPI returns icons as `//cdn.weatherapi.com/...`. Always prepend `https:`:
```javascript
const iconUrl = icon.startsWith('//') ? `https:${icon}` : icon;
```

### 3. Data Validation Pattern (Mandatory for All Update Functions)
```javascript
if (!data || !data.forecast || !data.forecast.forecastday) {
  console.error('Invalid forecast data');
  return;
}
```
**Every update function must validate data existence before accessing nested properties.**

### 4. Dynamic HTML Injection
Use template literals for forecast cards/hourly rows. Always round temperatures with `Math.round()`:
```javascript
forecastContainer.innerHTML += `
  <div class="col mb-4">
    <h3>${Math.round(day.day.maxtemp_c)}° / ${Math.round(day.day.mintemp_c)}°</h3>
  </div>
`;
```

## API Integration

### WeatherAPI Configuration
- **Host**: `weatherapi-com.p.rapidapi.com`
- **Endpoint**: `/forecast.json`
- **Required params**: `q=${encodeURIComponent(city)}&days=3&aqi=yes&alerts=yes`
- **Headers**: `x-rapidapi-key`, `x-rapidapi-host`

### Response Structure Reference
- `data.current.air_quality['us-epa-index']` → AQI level (1-6)
- `data.forecast.forecastday[0].hour[currentHour]` → Hourly forecast (0-23 index)
- `data.forecast.forecastday[0].astro` → Sun/moon data
- `data.alerts.alert[]` → Government weather warnings (conditional)

## UI/UX Conventions

### Color Scheme
- Primary gradient: Purple (#667eea) → Pink (#764ba2)
- Accent: Gold (#ffd700) for temperatures, highlights
- Text: White with varying opacity (0.7-1.0)

### Animation Standards
- Hover scale: `1.05` (cards), `translateY(-15px)` (weather cards)
- Transition timing: `0.3s ease` (most), `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)` (cards)
- Particle animation: 20s infinite float

### Responsive Breakpoints
Bootstrap grid: `row-cols-1 row-cols-md-3` (mobile → desktop)

## Development Workflow

### Testing Locally
1. Open `index.html` directly in browser (no build step)
2. Check console for API errors (F12)
3. Default city loads on page load: Delhi

### Common Tasks
- **Add new weather metric**: Update relevant section in `index.html`, add ID, update corresponding function in `script.js`
- **Fix API issues**: Check `encodeURIComponent()` usage, verify icon URL handling, validate data structure
- **Style changes**: Modify embedded `<style>` in `index.html` (lines 12-533)

## Known Constraints

1. **No build tooling** - Pure HTML/CSS/JS, no npm/bundlers
2. **RapidAPI limitations** - Free tier has rate limits, API key exposed in client code
3. **Hourly forecast** - Limited to remaining hours of current day (max 24 - currentHour)
4. **Air quality data** - Not available for all locations (handle gracefully with N/A fallback)

## Project-Specific Gotchas

- **Script loading**: Use `<script src="script.js">` NOT `type="module"` (causes scope issues)
- **FontAwesome classes**: Heavily used for icons (`fas fa-*`), don't remove Font Awesome CDN link
- **Section anchors**: Nav links use `#current`, `#forecast`, `#astronomy`, `#air-quality` for smooth scroll
- **AQI color coding**: `getAQIDescription()` returns color hex values - apply to `style.color` directly

## Examples from Codebase

**Good**: Proper error handling with user feedback
```javascript
catch (error) {
  console.error('Error fetching weather:', error);
  alert(`Failed to fetch weather data: ${error.message}`);
  showLoading(false);
}
```

**Good**: Conditional rendering for optional data
```javascript
if (data.alerts && data.alerts.alert && data.alerts.alert.length > 0) {
  alertsSection.style.display = 'block';
  // render alerts
} else {
  alertsSection.style.display = 'none';
}
```

## Priority Guidelines for AI Agents

1. **Always validate API response data** before DOM manipulation
2. **Maintain glassmorphism aesthetic** in all new UI components
3. **Round all temperature values** for clean display
4. **Handle missing data gracefully** (use `|| '--'` fallbacks)
5. **Test with multiple cities** (some lack AQI/alerts data)
