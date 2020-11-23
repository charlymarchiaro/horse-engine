import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api } from '@loopback/rest';
import * as fromScrapyd from '../services/scrapyd.service';
import * as fromScrapydHourlyScheduler from '../services/scrapyd-hourly-scheduler.service';
import { ArticleSpiderRepository } from '../repositories';
import { model, property } from '@loopback/repository';
import { ArticleSpider } from '../models';
import { ArticleSpiderRelations } from '../models/article-spider.model';
import { exception } from 'console';
import { ScrapydHourlySchedulerService } from '../services';
import { ScrapydConstants } from '../keys';



@model()
export class ScheduleSpiderRequestBody {
  @property() spiderName: string;
  @property() periodDaysBack: number;
}

@model()
export class BulkScheduleSpiderRequestBody {
  @property() periodDaysBack: number;
}

@model()
export class CancelJobRequestBody {
  @property() job: string;
}


@api({ basePath: 'scrapyd' })
export class ScrapydController {

  constructor(
    @inject('services.Scrapyd')
    protected scrapydService: fromScrapyd.Scrapyd,
    @inject('services.ScrapydHourlySchedulerService')
    protected scrapydHourlyScheduler: ScrapydHourlySchedulerService,
    @repository(ArticleSpiderRepository)
    public articleSpiderRepository: ArticleSpiderRepository,
  ) { }


  @get('/list-scrapyd-nodes', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.ScrapydNodeListInfo },
          },
        },
      },
    },
  })
  async listScrapydNodes(): Promise<fromScrapyd.ScrapydNodeListInfo> {
    return { nodes: ScrapydConstants.SCRAPYD_NODE_IDS };
  }


  @get('/list-spiders', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.SpidersListInfo },
          },
        },
      },
    },
  })
  async listSpiders(): Promise<fromScrapyd.SpidersListInfo> {
    return this.scrapydService.listSpiders();
  }


  @post('/schedule-spider', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.JobScheduleInfo },
          },
        },
      },
    },
  })
  async scheduleSpider(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': ScheduleSpiderRequestBody },
        }
      },
    })
    body: ScheduleSpiderRequestBody,
  ): Promise<fromScrapyd.JobScheduleInfo> {
    return this.scrapydService.scheduleSpider(body.spiderName, body.periodDaysBack);
  }


  @post('/schedule-all-spiders', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.BulkJobScheduleInfo },
          },
        },
      },
    },
  })
  async scheduleAllSpiders(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': BulkScheduleSpiderRequestBody },
        }
      },
    })
    body: BulkScheduleSpiderRequestBody,
  ): Promise<fromScrapyd.BulkJobScheduleInfo> {

    const filter: Filter<ArticleSpider> = {
      include: [{ relation: 'articleSource' }]
    };
    const spiders = await this.articleSpiderRepository.find(filter);

    spiders.sort(
      // Sort by parseCategory, tier, reach and name
      (a, b) => {
        if (!a.articleSource || !b.articleSource) {
          throw exception('Article source data is missing.');
        }
        if (a.articleSource.parseCategory !== b.articleSource.parseCategory) {
          return a.articleSource.parseCategory === 'base' && b.articleSource.parseCategory === 'full' ? 1 : -1;
        }
        return (a.articleSource.tier - b.articleSource.tier)
          || (b.articleSource.reach - a.articleSource.reach)
          || (a.name > b.name ? 1 : -1);
      }
    )

    const promises: Promise<fromScrapyd.JobScheduleInfo>[] = [];

    spiders.forEach(s => {
      promises.push(this.scrapydService.scheduleSpider(s.name, body.periodDaysBack))
    })

    const items = await Promise.all(promises);

    return { items }
  }


  @get('/hourly-spiders-schedule', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapydHourlyScheduler.ScheduleInfo },
          },
        },
      },
    },
  })
  async getHourlySpidersSchedule(): Promise<fromScrapydHourlyScheduler.ScheduleInfo> {
    const result = await this.scrapydHourlyScheduler.getHourlySpidersSchedule();
    return result;
  }


  @post('/schedule-spiders-hourly', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.BulkJobScheduleInfo },
          },
        },
      },
    },
  })
  async scheduleSpidersHourly(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': BulkScheduleSpiderRequestBody },
        }
      },
    })
    body: BulkScheduleSpiderRequestBody,
  ): Promise<fromScrapyd.BulkJobScheduleInfo> {

    const filter: Filter<ArticleSpider> = {
      include: [{ relation: 'articleSource' }]
    };

    const result = await this.scrapydHourlyScheduler.scheduleSpidersHourly(
      body.periodDaysBack
    );

    return result;
  }


  @get('/list-jobs', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.JobsListInfo },
          },
        },
      },
    },
  })
  async listJobs(): Promise<fromScrapyd.JobsListInfo> {
    return this.scrapydService.listJobs();
  }


  @post('/cancel-job', {
    responses: {
      '200': {
        content: {
          'application/json': {
            schema: { 'x-ts-type': fromScrapyd.JobScheduleInfo },
          },
        },
      },
    },
  })
  async cancelJob(
    @requestBody({
      content: {
        'application/json': {
          schema: { 'x-ts-type': CancelJobRequestBody },
        }
      },
    })
    body: CancelJobRequestBody,
  ): Promise<fromScrapyd.JobScheduleInfo> {
    return this.scrapydService.cancelJob(body.job);
  }
}
