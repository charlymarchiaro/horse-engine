import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { ScrapydConstants } from '../keys';
import { exception } from 'console';


const config = (scrapydNodeId: string) => {

  const node = ScrapydConstants.SCRAPYD_NODES.find(n => n.id === scrapydNodeId);

  if (!node) {
    throw exception('Invalid Scrapyd node id: ' + scrapydNodeId);
  }

  const baseUrl = `http://${node.host}:${node.port}`;

  return ({
    name: 'scrapyd',
    connector: 'rest',
    baseURL: baseUrl,
    crud: false,
    "debug": "false",
    "operations": [
      {
        "template": {
          "method": "GET",
          "url": baseUrl + "/listspiders.json",
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
          "url": baseUrl + "/schedule.json",
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
          "url": baseUrl + "/listjobs.json",
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
          "url": baseUrl + "/cancel.json",
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
  })
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


export const scrapydDataSourceFactory = (scrapydNodeId: string) => {
  const dsConfig = config(scrapydNodeId);
  return new ScrapydDataSource(dsConfig);
};
