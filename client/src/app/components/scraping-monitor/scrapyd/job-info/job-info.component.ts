import { Component, OnInit, Input } from '@angular/core';
import { JobInfo } from '../../model/scrapyd/scrapyd.model';



@Component({
  selector: 'app-job-info',
  templateUrl: './job-info.component.html',
  styleUrls: ['./job-info.component.scss']
})
export class JobInfoComponent implements OnInit {


  @Input() public jobInfo: JobInfo;


  constructor() { }


  ngOnInit() {
  }

}
