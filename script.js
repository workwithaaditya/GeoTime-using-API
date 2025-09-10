// Target the navbar search form and input
const searchForm = document.querySelector('form[role="search"]');
const searchInput = searchForm.querySelector('input[type="search"]');

// Function to fetch weather alerts from RapidAPI
async function getWeather(city) {
  const url = `https://weatherapi-com.p.rapidapi.com/alerts.json?q=${city}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '8bee34e197msh6f107bb89434ed3p109bb6jsn654f791faa2f', // use your key
      'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    // Only update DOM if location exists
    if (result.location) {
      document.querySelector("#name2").textContent = result.location.name;
      document.querySelector("#name").textContent = result.location.name;
      document.querySelector("#region").textContent = result.location.region;
      document.querySelector("#country").textContent = result.location.country;
      document.querySelector("#latitude").textContent = result.location.lat;
      document.querySelector("#longitude").textContent = result.location.lon;
      document.querySelector("#tz_id").textContent = result.location.tz_id;
      document.querySelector("#localtime_epoch").textContent = result.location.localtime_epoch;
      document.querySelector("#localtime").textContent = result.location.localtime;
    } 

  } catch (error) {
    console.error(error);
    document.querySelector("#name2").textContent = "⚠️ Error fetching data.";
  }
}

// Listen for submit event on navbar search form
searchForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Prevent page reload
  const city = searchInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    document.querySelector("#name2").textContent = "⚠️ Please enter a city name.";
  }
});
