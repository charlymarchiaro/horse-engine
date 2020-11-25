import legacy from 'loopback-datasource-juggler';
export declare namespace juggler {
  export import DataSource = legacy.DataSource;
}

import { getService } from '@loopback/service-proxy';
import { Provider } from '@loopback/core';
import { ScrapydDataSource } from '../datasources';
import { model, property } from '@loopback/repository';
import { ScrapydConstants } from '../keys';
import { scrapydDataSourceFactory } from '../datasources/scrapyd.datasource';


@model()
export class ScrapydNodeListInfo {
  @property.array(String) nodes: string[];
}

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
  @property() nodeId?: string;
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

@model()
export class BulkJobScheduleInfo {
  @property.array(JobScheduleInfo) items: JobScheduleInfo[];
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


export class ScrapydProvider implements Provider<{ [id: string]: Scrapyd }> {

  protected dataSources: { [id: string]: ScrapydDataSource };

  constructor() {

    this.dataSources = {};

    const nodes = ScrapydConstants.SCRAPYD_NODES;

    nodes.forEach(n => {
      this.dataSources[n.id] = scrapydDataSourceFactory(n.id)
    })
  }

  async getServices(dss: { [id: string]: ScrapydDataSource }) {

    const response: { [id: string]: Scrapyd } = {};

    for (const id of Object.keys(dss)) {
      const ds = dss[id];
      response[id] = await getService<Scrapyd>(ds)
    };

    return response;
  }

  value(): Promise<{ [id: string]: Scrapyd }> {
    return this.getServices(this.dataSources);
  }
}
