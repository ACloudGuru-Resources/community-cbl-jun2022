const express = require('express')
const req = require('express/lib/request')
const app = express()
const port = process.env.PORT || 8080

// Get COVID data in memory
// This entire JSON file (over 100MB) is read into memory.  This would be
// handled much differently in a real production system.  This was done in
// this manner to simplify the demo.
const data = require('./data.json')

// Default 'Hello World' route
app.get('/', (req, res) => {
  res.send('Hello World!')
})

/**
 * API to get all of the countries included in the data
 * 
 * Example: http://localhost:8080/api/countries
 */
app.get('/api/countries', (req, res, next) => {
  const countryCodes = Object.keys(data);
  const countries = countryCodes.map((code) => {
    return {
      code: code,
      name: data[code].location,
      continent: data[code].continent
    }
  })
  res.json({ countries })
})

/**
 * API to get the COVID stats for a specific country on a specific day
 * 
 * COUNTRY - Uses the standard 3 letter abbreviation (for example, USA)
 * DATE - The date to fetch data for in the YYYY-MM-DD format
 * Example: http://localhost:8080/api/USA/2022-04-01
 */
app.get('/api/:country/:date', (req, res, next) => {
  // Does country exist
  if(!data[req.params.country]) {
    res.status(404).json({ message: `Country ${req.params.country} not found`})
    return;
  }

  // Get copy of country data
  const countryData = data[req.params.country];

  const output = {
    continent: countryData.continent,
    location: countryData.location
  }

  // Get all
  if(req.params.date === 'all') {
    output.data = countryData.data
    res.json(output)
    return
  }

  // Get specific date
  const dateData = countryData.data.find((d) => d.date === req.params.date)
  if(!dateData) {
    res.status(404).json({ message: `Date ${req.params.date} for Country ${req.params.country} not found`})
    return
  }
  output.data = dateData;

  // Return
  res.json(output)
})

/**
 * API to get Country data alongside the most recent date of COVID stats
 * 
 * COUNTRY - Uses the standard 3 letter abbreviation (for example, USA)
 * Example: http://localhost:8080/api/USA
 * 
 * 
 */
 app.get('/api/:country', (req, res, next) => {
  // Does country exist
  if(!data[req.params.country]) {
    res.status(404).json({ message: `Country ${req.params.country} not found`})
    return;
  }

  // Get copy of country data
  const countryData = data[req.params.country];

  // Get latest date
  const dateData = countryData.data;
  const latestDate = dateData[dateData.length - 1];

  const output = {
    ...countryData,
    data: latestDate
  }

  // Return
  res.json(output)
})

// Default Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: `Server Error: ${err}`})
  console.dir(err);
})

app.listen(port, () => {
  console.log(`Covid API listening on port ${port}`)
})
