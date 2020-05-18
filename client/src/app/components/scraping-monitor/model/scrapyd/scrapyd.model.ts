
export interface SpidersListInfo {
  node_name: string;
  status: string;
  spiders: string[];
}


export interface JobInfo {
  project: string;
  spider: string;
  id: string;
  start_time?: string;
  end_time?: string;
}


export interface JobsListInfo {
  node_name: string;
  status: string;
  pending: JobInfo[];
  running: JobInfo[];
  finished: JobInfo[];
}


export interface JobScheduleInfo {
  node_name: string;
  status: string;
  jobid: string;
}
