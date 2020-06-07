import { Component, OnInit, Input } from '@angular/core';
import { JobInfo } from '../../../../model/scrapyd.model';
import { ClipboardService } from '../../../../services/utils/clipboard-service';




@Component({
  selector: 'app-job-info',
  templateUrl: './job-info.component.html',
  styleUrls: ['./job-info.component.scss']
})
export class JobInfoComponent implements OnInit {


  @Input() public jobInfo: JobInfo;


  constructor(
    public clipboard: ClipboardService,
  ) { }


  ngOnInit() {
  }

}
