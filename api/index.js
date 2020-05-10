const keys = require('./keys');

var fetchUrl = require("fetch").fetchUrl;

const SCRAPYD_URL = 'http://' + keys.scrapydHost + ':' + keys.scrapydPort;

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});
pgClient.on('error', () => console.log('Lost PG connection'));


// Express Route Handlers
app.get('/', (req, res) => {
  res.send('<< Horse Engine API >> is up and running.');
});


app.get('/backend/test', async (req, res) => {
  try {
    const values = await pgClient.query(`
    SELECT id, source_name, url, title, text, last_updated, scraped_at, spider_name, parse_function, result, error, error_details
    FROM public.scraped_articles
    LIMIT 100;
  `);

    res.send([keys.pgHost, values.rows]);
  } catch (e) {
    res.send(e);
  }
});


app.get('/list-spiders', async (req, res) => {
  try {
    fetchUrl(
      SCRAPYD_URL + '/listspiders.json?project=horse_scraper',
      { method: 'GET' },
      (error, meta, body) => res.send(body.toString()),
    );
  } catch (e) {
    res.send(e);
  }
});


app.post('/schedule-spider', async (req, res) => {

  try {
    const spiderName = req.body.spiderName;

    fetchUrl(
      SCRAPYD_URL + '/schedule.json?project=horse_scraper&spider=' + spiderName,
      { method: 'POST' },
      (error, meta, body) => res.send(body.toString()),
    );
  } catch (e) {
    res.send(e);
  }
});


app.get('/list-jobs', async (req, res) => {
  try {
    fetchUrl(
      SCRAPYD_URL + '/listjobs.json?project=horse_scraper',
      { method: 'GET' },
      (error, meta, body) => res.send(body.toString()),
    );
  } catch (e) {
    res.send(e);
  }
});




app.listen(5000, err => {
  console.log('Listening');
});
