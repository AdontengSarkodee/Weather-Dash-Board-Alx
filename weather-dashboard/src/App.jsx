import React, {useEffect, useState} from 'react'
import { geocodeCity, fetchWeatherByCoords } from './api/weather'
import Spinner from './components/Spinner'

const DEFAULT_CITY = 'Accra'

function useLocal(key, initial){
  const [s, setS] = useState(()=>{
    try{ const raw = localStorage.getItem(key); return raw? JSON.parse(raw) : initial }catch(e){ return initial }
  })
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(s)) }catch(e){} }, [key, s])
  return [s, setS]
}

export default function App(){
  const [units, setUnits] = useLocal('units', 'metric') // 'metric' or 'imperial'
  const [query, setQuery] = useState('')
  const [city, setCity] = useState(DEFAULT_CITY)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true); setError(null)
        const geo = await geocodeCity(city)
        const w = await fetchWeatherByCoords(geo.lat, geo.lon, units)
        setData({ city: geo.name, ...w })
      }catch(err){ setError(err.message) }
      finally{ setLoading(false) }
    })()
  }, [city, units])

  async function handleSearch(e){
    e.preventDefault()
    if (!query) return
    setCity(query)
    setQuery('')
  }

  function handleCurrentLocation(){
    if (!navigator.geolocation) return setError('Geolocation is not supported')
    setLoading(true); setError(null)
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const {latitude: lat, longitude: lon} = pos.coords
        const w = await fetchWeatherByCoords(lat, lon, units)
        setData({ city: 'Current location', ...w })
      }catch(err){ setError(err.message) }
      finally{ setLoading(false) }
    }, err=>{ setLoading(false); setError(err.message) })
  }

  return (
    <div className="min-h-screen p-6 md:p-12 bg-[#1f1b1b] text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 items-center w-full md:w-2/3">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search for your preferred city..." className="flex-1 rounded-full px-4 py-2 bg-white/10 outline-none" />
            <button type="submit" className="px-4 py-2 rounded-full bg-white/10">Search</button>
            <button type="button" onClick={handleCurrentLocation} className="px-4 py-2 rounded-full bg-white/10">Current Location</button>
            <div className="ml-4">
              <label className="mr-2">°C</label>
              <input type="checkbox" checked={units==='imperial'} onChange={e=>setUnits(e.target.checked? 'imperial' : 'metric')} />
              <label className="ml-2">°F</label>
            </div>
          </form>
        </header>

        {loading && <Spinner />}
        {error && <div className="bg-red-700/50 p-4 rounded">Error: {error}</div>}

        {!loading && data && (
          <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card text-white rounded-xl-lg p-6">
              <div className="text-3xl font-bold">{data.city}</div>
              <div className="text-6xl font-extrabold my-4">{Math.round(data.current.temp)}°{units==='metric'? 'C' : 'F'}</div>
              <div className="text-sm text-white/80">Feels like: {Math.round(data.current.feels_like)}°</div>
              <div className="text-sm text-white/80 mt-3">{new Date(data.current.dt*1000).toLocaleString()}</div>
            </div>

            <div className="md:col-span-2 bg-card rounded-xl-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-5xl font-extrabold">{Math.round(data.current.temp)}°{units==='metric'? 'C' : 'F'}</div>
                  <div className="text-lg mt-2">Feels like: <strong>{Math.round(data.current.feels_like)}°</strong></div>
                  <div className="mt-4 text-xl font-bold">{data.current.weather.description}</div>
                </div>
                <div className="text-right">
                  <div>Humidity: {data.current.humidity}%</div>
                  <div className="mt-4">Wind: {data.current.wind_speed} {units==='metric'? 'm/s' : 'mph'}</div>
                </div>
              </div>

              {/* Hourly */}
              <section className="mt-6">
                <h3 className="font-bold mb-2">Hourly</h3>
                <div className="flex gap-4 overflow-x-auto py-2">
                  {data.hourly.map(h=> (
                    <div key={h.dt} className="min-w-[110px] p-3 rounded-xl bg-white/5 text-center">
                      <div className="text-sm">{new Date(h.dt*1000).toLocaleTimeString([], {hour:'numeric',minute:undefined})}</div>
                      <div className="text-xl font-bold">{Math.round(h.temp)}°</div>
                      <div className="text-xs">{Math.round(h.wind_speed)} {units==='metric'? 'm/s' : 'mph'}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Daily */}
              <section className="mt-6">
                <h3 className="font-bold mb-2">3 Days</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.daily.slice(0,3).map(d=> (
                    <div key={d.dt} className="p-4 bg-white/5 rounded">
                      <div>{new Date(d.dt*1000).toLocaleDateString()}</div>
                      <div className="text-lg font-bold">{Math.round(d.temp)}°</div>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </main>
        )}

        {!loading && !data && !error && (
          <div className="text-center text-white/50">Search for a city to get started</div>
        )}

      </div>
    </div>
  )
}
