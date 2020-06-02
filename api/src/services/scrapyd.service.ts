import { getService } from '@loopback/service-proxy';
import { inject, Provider } from '@loopback/core';
import { ScrapydDataSource } from '../datasources';
import { model, property } from '@loopback/repository';


@model()
export class SpidersListInfo {
  @property() node_name: string;
  @property() status: string;
  @property.array(String) spiders: string[];
}

@model()
export class JobInfo {
  @property() project: string;
  @property() spider: string;
  @property() id: string;
  @property() start_time?: string;
  @property() end_time?: string;
}

@model()
export class JobsListInfo {
  @property() node_name: string;
  @property() status: string;
  @property.array(JobInfo) pending: JobInfo[];
  @property.array(JobInfo) running: JobInfo[];
  @property.array(JobInfo) finished: JobInfo[];
}

@model()
export class JobScheduleInfo {
  @property() node_name: string;
  @property() status: string;
  @property() jobid: string;
}

export interface Scrapyd {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  listSpiders(): Promise<SpidersListInfo>;
  scheduleSpider(spiderName: string, periodDaysBack: number): Promise<JobScheduleInfo>;
  listJobs(): Promise<JobsListInfo>;
  cancelJob(job: string): Promise<JobScheduleInfo>;
}

export class ScrapydProvider implements Provider<Scrapyd> {
  constructor(
    // scrapyd must match the name property in the datasource json file
    @inject('datasources.scrapyd')
    protected dataSource: ScrapydDataSource = new ScrapydDataSource(),
  ) { }

  value(): Promise<Scrapyd> {
    return getService(this.dataSource);
  }
}
