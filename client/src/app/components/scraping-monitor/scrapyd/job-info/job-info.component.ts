import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { JobInfo } from '../../../../model/scrapyd.model';
import { ClipboardService } from '../../../../services/utils/clipboard-service';
import { DatePipe } from '@angular/common';
import { getDateDiffMilisec } from '../../../../services/utils/utils';




@Component({
  selector: 'app-job-info',
  templateUrl: './job-info.component.html',
  styleUrls: ['./job-info.component.scss']
})
export class JobInfoComponent implements OnInit, OnChanges {


  public runTimeHours: string;


  @Input() public jobInfo: JobInfo;


  constructor(
    public clipboard: ClipboardService,
  ) { }


  ngOnInit() {
    this.updateData();
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.updateData();
  }


  private updateData() {
    if (
      !this.jobInfo
      || !this.jobInfo.start_time
    ) {
      this.runTimeHours = null;
      return;
    }

    const startTime = new Date(this.jobInfo.start_time);
    const endTime = (this.jobInfo.end_time)
      ? new Date(this.jobInfo.end_time)
      : new Date();

    this.runTimeHours = (
      getDateDiffMilisec(startTime, endTime) / (1000 * 3600)
    ).toFixed(2);
  }
}
