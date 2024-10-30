"use strict";

const http = require('http');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const port = 8080;

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('trust proxy', true);
app.set('trust proxy', 'loopback');

app.get('/flagList', (req, res) => {
  const filters = req.query;

  const filterCountries = country => {
    if (filters.sovereign === "yes" && !country.sovereign) return false;
    if (filters.sovereign === "no" && country.sovereign) return false;

    if (filters.continent) {
      // filters.continent can be an array
      if (country.continent !== filters.continent &&
          !filters.continent.includes(country.continent))
      {
        return false;
      }
    }

    return true;
  };

  // read JSON objects from flag list file
  fs.readFile('resources/flags.json', (err, data) => {
    if (err) {
      res.sendStatus(500); // internal server error
      console.log(err);
      return;
    }

    const countriesArray = JSON.parse(data);
    const filteredArray = countriesArray.filter(filterCountries);

    res.json(filteredArray);
  });
})

// all unknown endpoints return a 404
app.get('*', (_, res) => {
  res.sendStatus(404);
});

http.createServer(app).listen(port);