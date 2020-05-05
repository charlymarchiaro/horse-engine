import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BackendService } from '../services/backend.service';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent implements OnInit, OnDestroy {


  private timer;

  public time: string;
  public backendMessage: string;


  constructor(
    private datePipe: DatePipe,
    private backendService: BackendService,
  ) { }


  ngOnInit() {
    this.timer = setInterval(
      () => this.updateTime(),
      1000
    );

    this.updateTime();
    this.listAllSpiders();
  }


  ngOnDestroy() {
    clearInterval(this.timer);
  }


  public onListAllSpidersClick() {
    this.listAllSpiders();
  }


  public onScheduleAllSpidersClick() {
    this.scheduleAllSpiders();
  }


  private listAllSpiders() {
    this.backendService.listAllSpiders().subscribe(
      response => console.log(response.spiders)
    );
  }


  private scheduleAllSpiders() {

    const spiderNames = [
      'clarin_crawl',
      'clarin_sitemap',
      'cronista_crawl',
      'cronista_sitemap',
      'infobae_crawl',
      'infobae_sitemap',
      'la_nacion_crawl',
      'la_nacion_sitemap',
      'metro951_crawl',
      'metro951_sitemap',
    ];

    for (const spiderName of spiderNames) {
      this.backendService.scheduleSpider(spiderName).subscribe(
        response => console.log(response)
      );
    }
  }


  private updateTime() {
    this.time = this.datePipe.transform(Date.now(), 'medium');
  }
}
