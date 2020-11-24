import { inject } from '@loopback/core';
import { repository, Filter } from '@loopback/repository';
import { get, post, requestBody, api, param } from '@loopback/rest';
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
  @property() scrapydNodeId: string;
  @property() spiderName: string;
  @property() periodDaysBack: number;
}

@model()
export class BulkScheduleSpiderRequestBody {
  @property() scrapydNodeId: string;
  @property() periodDaysBack: number;
}

@model()
export class CancelJobRequestBody {
  @property() scrapydNodeId: string;
  @property() job: string;
}


@api({ basePath: 'scrapyd' })
export class ScrapydController {

  constructor(
    @inject('services.Scrapyd')
    protected scrapydServices: { [id: string]: fromScrapyd.Scrapyd },
    @inject('services.ScrapydHourlySchedulerService')
    protected scrapydHourlyScheduler: ScrapydHourlySchedulerService,
    @repository(ArticleSpiderRepository)
    public articleSpiderRepository: ArticleSpiderRepository,
  ) {
    console.log(scrapydServices)
  }


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
    return { nodes: ScrapydConstants.SCRAPYD_NODES.map(n => n.id) };
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
  async listSpiders(
    @param.query.string('scrapydNodeId') scrapydNodeId: string
  ): Promise<fromScrapyd.SpidersListInfo> {
    return this.scrapydServices[scrapydNodeId].listSpiders();
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
    return this.scrapydServices[body.scrapydNodeId].scheduleSpider(
      body.spiderName,
      body.periodDaysBack
    );
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
      promises.push(this.scrapydServices[body.scrapydNodeId].scheduleSpider(
        s.name,
        body.periodDaysBack
      ))
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
  async getHourlySpidersSchedule(
    @param.query.string('scrapydNodeId') scrapydNodeId: string
  ): Promise<fromScrapydHourlyScheduler.ScheduleInfo> {
    const result = await this.scrapydHourlyScheduler.getHourlySpidersSchedule(scrapydNodeId);
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
      body.periodDaysBack,
      body.scrapydNodeId,
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
  async listJobs(
    @param.query.string('scrapydNodeId') scrapydNodeId: string
  ): Promise<fromScrapyd.JobsListInfo> {
    return this.scrapydServices[scrapydNodeId].listJobs();
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
    return this.scrapydServices[body.scrapydNodeId].cancelJob(body.job);
  }
}
