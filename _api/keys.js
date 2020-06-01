module.exports = {
  pgHost: process.env.PG_HOST,
  pgPort: parseInt(process.env.PG_PORT),
  pgUser: process.env.PG_USER,
  pgPassword: process.env.PG_PASSWORD,
  pgDatabase: process.env.PG_DATABASE,
  scrapydHost: process.env.SCRAPYD_HOST,
  scrapydPort: process.env.SCRAPYD_PORT,
};