const BASE = import.meta.env.VITE_OPENWEATHER_BASE || 'https://api.openweathermap.org/data/2.5'
const KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

if (!KEY) console.warn('VITE_OPENWEATHER_API_KEY is not set')

async function fetchJson(url){
  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function geocodeCity(city){
  const url = `${BASE}/weather?q=${encodeURIComponent(city)}&appid=${KEY}`
  const data = await fetchJson(url)
  return { name: data.name, lat: data.coord.lat, lon: data.coord.lon }
}

export async function fetchWeatherByCoords(lat, lon, units='metric'){
  const url = `${BASE}/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,alerts&appid=${KEY}`
  const data = await fetchJson(url)
  return {
    timezone: data.timezone,
    current: {
      dt: data.current.dt,
      temp: data.current.temp,
      feels_like: data.current.feels_like,
      humidity: data.current.humidity,
      wind_speed: data.current.wind_speed,
      weather: data.current.weather[0]
    },
    hourly: data.hourly.slice(0, 12).map(h=>({ dt: h.dt, temp: h.temp, wind_speed: h.wind_speed, weather: h.weather[0]})),
    daily: data.daily.slice(0, 4).map(d=>({ dt: d.dt, temp: d.temp.day, weather: d.weather[0]}))
  }
}
