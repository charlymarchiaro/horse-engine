import { inject } from '@loopback/core';
import { get, post, requestBody } from '@loopback/rest';
import * as fromScrapyd from '../services/scrapyd.service';
import { model, property } from '@loopback/repository';


@model()
export class ScheduleSpiderRequestBody {
  @property() spiderName: string;
  @property() periodDaysBack: number;
}

@model()
export class CancelJobRequestBody {
  @property() job: string;
}


export class ScrapydController {

  constructor(
    @inject('services.Scrapyd')
    protected scrapydService: fromScrapyd.Scrapyd
  ) { }


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
