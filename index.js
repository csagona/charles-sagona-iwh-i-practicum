const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

// --- App configuration ---
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// --- HubSpot configuration ---
const PRIVATE_APP_TOKEN = process.env.PRIVATE_APP_TOKEN;
const CUSTOM_OBJECT_TYPE = process.env.CUSTOM_OBJECT_TYPE;
const PROPERTIES = ['name', 'artist', 'year'];

const headers = {
  Authorization: `Bearer ${PRIVATE_APP_TOKEN}`,
  'Content-Type': 'application/json',
};

// ROUTE 1 — Homepage: GET records, render table
app.get('/', async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}?properties=${PROPERTIES.join(',')}&limit=100`;
  try {
    const response = await axios.get(url, { headers });
    res.render('homepage', {
      title: 'Custom Object Table | Integrating With HubSpot I Practicum',
      records: response.data.results,
    });
  } catch (error) {
    console.error('Error fetching records:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching records. Check your token and object type.');
  }
});

// ROUTE 2 — GET the form
app.get('/update-cobj', async (req, res) => {
  res.render('updates', {
    title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// ROUTE 3 — POST the form, create record, redirect home
app.post('/update-cobj', async (req, res) => {
  const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`;
  const newRecord = {
    properties: {
      name: req.body.name,
      artist: req.body.artist,
      year: req.body.year,
    },
  };
  try {
    await axios.post(url, newRecord, { headers });
    res.redirect('/');
  } catch (error) {
    console.error('Error creating record:', error.response ? error.response.data : error.message);
    res.status(500).send('Error creating the record.');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));