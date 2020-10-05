export namespace AppConstants {
  export const RESPONSE_TIMEOUT_SECS = 180;
}

export namespace PostgresConstants {
  export const PG_HOST = process.env.PG_HOST;
  export const PG_PORT = process.env.PG_PORT ? parseInt(process.env.PG_PORT) : 5432;
  export const PG_USER = process.env.PG_USER;
  export const PG_PASSWORD = process.env.PG_PASSWORD;
  export const PG_DATABASE = process.env.PG_DATABASE;
}

export namespace ScrapydConstants {
  export const SCRAPYD_HOST = process.env.SCRAPYD_HOST;
  export const SCRAPYD_PORT = process.env.SCRAPYD_PORT;
}

