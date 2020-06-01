const keys = require('./keys');

const { Pool } = require('pg');

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
const pool = new Pool({
  host: keys.pgHost,
  port: keys.pgPort,
  user: keys.pgUser,
  password: keys.pgPassword,
  database: keys.pgDatabase,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 0,
  max: 20,
});

pool.on('error', (err) => console.log('  >> PG: error - Details: ' + err.message));

// Express Route Handlers
app.get('/', (req, res) => {
  res.send('<< Horse Engine API >> is up and running.');
});


app.get('/backend/test', async (req, res) => {

  console.log('');
  console.log('Testing DB connection...');

  pool.query(`
    SELECT id, source_name, url, title, text, last_updated, scraped_at, spider_name, parse_function, result, error, error_details
    FROM public.scraped_articles
    LIMIT 100;
  `)
    .then(result => {
      console.log('--> DB connection test result: OK');
      res.send({ result: 'success', data: result.rows });
    })
    .catch(e => {
      console.log('--> DB connection test result: ERROR');
      console.log(e);
      res.send({ result: 'error', error: e });
    });
});


// Scraper

app.post('/last-scraped-articles-info', async (req, res) => {

  try {
    const numberOfArticles = req.body.numberOfArticles;

    const data = await pool.query(
      `
      SELECT 
          id, 
          source_name, 
          CONCAT(LEFT(url, 20), '...') AS url, 
          CONCAT(LEFT(title, 20), '...') AS title, 
          CONCAT(LEFT(text, 20), '...') AS text, 
          last_updated, 
          scraped_at, 
          spider_name, 
          parse_function, 
          result, 
          error, 
          error_details
      FROM public.scraped_articles
      ORDER BY scraped_at DESC
      LIMIT $1
      `,
      [numberOfArticles]
    );

    res.send({ data: data.rows });
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
    const args = req.body.args || {};

    const periodDaysBack = args.periodDaysBack;

    let url = SCRAPYD_URL + '/schedule.json?project=horse_scraper&spider=' + spiderName;

    if (!!periodDaysBack) {
      url += '&period_days_back=' + periodDaysBack;
    }

    fetchUrl(
      url,
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


app.post('/cancel-job', async (req, res) => {
  try {
    const job = req.body.job;

    fetchUrl(
      SCRAPYD_URL + '/cancel.json?project=horse_scraper&job=' + job,
      { method: 'POST' },
      (error, meta, body) => res.send(body.toString()),
    );
  } catch (e) {
    res.send(e);
  }
});


// Keyword search

app.post('/article/search', async (req, res) => {
  try {
    const scheme = req.body.scheme;
    const dateSpan = req.body.dateSpan;

    const query = getArticleSearchQuery(scheme, dateSpan);

    const data = await pool.query(query.sqlQuery, query.args);

    res.send({ status: 'success', data: data.rows });

  } catch (e) {
    res.send({ status: 'error', error: e });
  }
});



app.listen(5000, err => {
  console.log('Listening');
});



function getArticleSearchQuery(scheme, dateSpan) {


  const args = [];

  let argIndex = 1;

  const schemeConditions = [];

  scheme.conditions.forEach(andGroup => {

    const andGroupConditions = [];

    andGroup.forEach(condition => {

      const part = condition.part;
      const matchCondition = getMatchConditionStr(condition);
      const textToMatch = condition.textToMatch;

      const conditionStr = `${part} ${matchCondition} $${argIndex}`;
      andGroupConditions.push(conditionStr);
      args.push(`%${textToMatch}%`);
      argIndex++;
    });

    schemeConditions.push('(' + andGroupConditions.join(' AND ') + ')');
  });

  let whereClause = ' WHERE ';
  whereClause += '(' + schemeConditions.join(' OR ') + ')';

  const fromDateStr = dateSpan.fromDateIncl;
  const toDateStr = dateSpan.toDateIncl;

  whereClause += ` AND last_updated BETWEEN '${fromDateStr}'::date AND ('${toDateStr}'::date + INTERVAL '1 day')`;

  const sqlQuery = `
                  SELECT 
                      id, 
                      source_name, 
                      url, 
                      title, 
                      text, 
                      last_updated, 
                      scraped_at, 
                      spider_name, 
                      parse_function, 
                      result, 
                      error, 
                      error_details
                  FROM 
                      public.scraped_articles
                  
                  ${whereClause}
                  
                  ORDER BY
                      last_updated, id
                  `;

  const sqlCount = 'SELECT COUNT(id) FROM public.scraped_articles' + whereClause;

  return { sqlCount, sqlQuery, args };
}


function getMatchConditionStr(condition) {
  if (condition.matchCondition === 'contains') {
    return condition.caseSensitive ? 'LIKE' : 'ILIKE';
  } else {
    return condition.caseSensitive ? 'NOT LIKE' : 'NOT ILIKE';
  }
}