import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { ScrapydConstants } from '../keys';

const BASE_URL = `http://${ScrapydConstants.SCRAPYD_HOST}:${ScrapydConstants.SCRAPYD_PORT}`;

const config = {
  name: 'scrapyd',
  connector: 'rest',
  baseURL: BASE_URL,
  crud: false,
  "debug": "false",
  "operations": [
    {
      "template": {
        "method": "GET",
        "url": BASE_URL + "/listspiders.json",
        "headers": {
          "accepts": "application/json",
        },
        "query": {
          "project": "horse_scraper"
        }
      },
      "functions": {
        "listSpiders": []
      }
    },
    {
      "template": {
        "method": "POST",
        "url": BASE_URL + "/schedule.json",
        "headers": {
          "accepts": "application/json",
        },
        "query": {
          "project": "horse_scraper",
          "spider": "{spiderName}",
          "period_days_back": "{periodDaysBack}",
        }
      },
      "functions": {
        "scheduleSpider": ["spiderName", "periodDaysBack"]
      }
    },
    {
      "template": {
        "method": "GET",
        "url": BASE_URL + "/listjobs.json",
        "headers": {
          "accepts": "application/json",
        },
        "query": {
          "project": "horse_scraper"
        }
      },
      "functions": {
        "listJobs": []
      }
    },
    {
      "template": {
        "method": "POST",
        "url": BASE_URL + "/cancel.json",
        "headers": {
          "accepts": "application/json",
        },
        "query": {
          "project": "horse_scraper",
          "job": "{job}"
        }
      },
      "functions": {
        "cancelJob": ["job"]
      }
    },
  ]
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ScrapydDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'scrapyd';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.scrapyd', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
