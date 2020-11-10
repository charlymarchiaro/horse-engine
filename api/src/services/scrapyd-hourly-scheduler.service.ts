import { injectable, /* inject, */ BindingScope, inject } from '@loopback/core';
import * as fromScrapyd from '../services/scrapyd.service';
import { repository, Filter } from '@loopback/repository';
import { ArticleSpiderRepository } from '../repositories/article-spider.repository';
import { ArticleSpider, ArticleSpiderWithRelations } from '../models/article-spider.model';
import { repeatValue, sleep } from '../utils';
import { exception } from 'console';

type CountryCode =
  | 'ar'
  | 'bo'
  | 'br'
  | 'cl'
  | 'co'
  | 'ec'
  | 'es'
  | 'mx'
  | 'py'
  | 'pe'
  | 'uy'
  | 've'
  ;

interface UtcInfo {
  offsetMin: number;
  offsetMax: number;
}

// https://es.wikipedia.org/wiki/Tiempo_universal_coordinado#/media/Archivo:World_Time_Zones_Map.png
const UTC_INFO_COUNTRY: { [countryCode in CountryCode]: UtcInfo } = {
  ar: { offsetMin: -3, offsetMax: -3 },
  bo: { offsetMin: -4, offsetMax: -4 },
  br: { offsetMin: -4, offsetMax: -3 },
  cl: { offsetMin: -4, offsetMax: -4 },
  co: { offsetMin: -5, offsetMax: -5 },
  ec: { offsetMin: -5, offsetMax: -5 },
  es: { offsetMin: 1, offsetMax: 1 },
  mx: { offsetMin: -7, offsetMax: -6 },
  py: { offsetMin: -4, offsetMax: -4 },
  pe: { offsetMin: -5, offsetMax: -5 },
  uy: { offsetMin: -3, offsetMax: -3 },
  ve: { offsetMin: -4, offsetMax: -4 },
}

const SITEMAP_SPIDER_SCHEDULE_RELATIVE_HOURS = {
  full: [0, 8, 16],
  base: [0, 12],
};


// Average run times for a default period of 15 days back
const SPIDER_AVG_RUN_TIME_HS = {
  full: { crawl: 1.987, sitemap: 0.036 },
  base: { crawl: 0.341, sitemap: 0.017 },
}


interface QueueItem {
  spider: ArticleSpiderWithRelations;
  optimumScheduleUtcHour: number;
  avgRunTimeHs: number;
}


interface ScheduleSlot {
  scheduledItems: QueueItem[];
  capacityHs: number;
  loadHs: number;
}


const PARALLEL_SCRAPYD_JOBS = 16;


@injectable({ scope: BindingScope.TRANSIENT })
export class ScrapydHourlySchedulerService {
  constructor(
    @inject('services.Scrapyd')
    protected scrapydService: fromScrapyd.Scrapyd,
    @repository(ArticleSpiderRepository)
    public articleSpiderRepository: ArticleSpiderRepository,
  ) { }

  public async scheduleSpidersHourly(periodDaysBack: number): Promise<fromScrapyd.BulkJobScheduleInfo> {

    // The function is designed to be called on an hourly basis.
    // Add a little delay to ensure a correct value for currentUtcHour
    await sleep(5000);
    const currentUtcHour = (new Date().getUTCHours());

    const schedule = await this.arrangeSchedule();

    const slot = schedule[repeatValue(currentUtcHour, 24)];

    console.log('');
    console.log('Scheduled jobs: ================================================================================================')
    console.log('');
    console.log({
      utc_hour: currentUtcHour,
      load_hs: slot.loadHs.toFixed(4),
    });
    console.table(
      slot.scheduledItems.map(i => ({
        name: i.spider.name,
        parse_categ: i.spider.articleSource?.parseCategory,
        tier: i.spider.articleSource?.tier,
        opt_utc_hour: i.optimumScheduleUtcHour,
        delta: repeatValue(currentUtcHour - i.optimumScheduleUtcHour, 24),
      }))
    );

    const promises: Promise<fromScrapyd.JobScheduleInfo>[] = [];

    slot.scheduledItems.forEach(i => {
      promises.push(
        this.scrapydService.scheduleSpider(i.spider.name, periodDaysBack)
      )
    })

    const items = await Promise.all(promises);

    return new Promise<fromScrapyd.BulkJobScheduleInfo>((resolve, reject) => {
      resolve({ items });
    });
  }


  public async arrangeSchedule(displayResults = false): Promise<{ [utcHour: number]: ScheduleSlot }> {

    const filter: Filter<ArticleSpider> = {
      include: [{ relation: 'articleSource' }]
    };
    const spiders = await this.articleSpiderRepository.find(filter);

    // Init schedule
    const schedule: { [utcHour: number]: ScheduleSlot } =
      [...Array(24).keys()].reduce<{ [utcHour: number]: ScheduleSlot }>(
        (d, i) => {
          d[i] = {
            scheduledItems: [],
            capacityHs: PARALLEL_SCRAPYD_JOBS,
            loadHs: 0,
          };
          return d;
        },
        {}
      );


    const queue: QueueItem[] = [];


    // Enqueue all jobs for each spider
    spiders.forEach(s => {

      const utcRunHours = (s.kind === 'crawl')
        // Crawl spider
        ? [this.getSpiderBaseUtcRunHour(s)]

        // Sitemap spider
        : this.getSitemapSpiderUtcRunHours(
          s.articleSource?.parseCategory === 'full' ? 'full' : 'base',
          this.getSpiderBaseUtcRunHour(s)
        );

      utcRunHours.forEach(utcHour => {
        queue.push({
          spider: s,
          optimumScheduleUtcHour: utcHour,
          avgRunTimeHs: this.getSpiderAvgRunTime(s),
        });
      });
    });

    // Sort jobs by kind, parseCategory, tier, reach and name
    queue.sort(
      (a, b) => {
        if (!a.spider.articleSource || !b.spider.articleSource) {
          throw exception('Article source data is missing.');
        }

        return false
          // full parse category over base parse category
          || (
            a.spider.articleSource.parseCategory !== b.spider.articleSource.parseCategory
              ? a.spider.articleSource.parseCategory === 'base' ? 1 : -1
              : 0
          )
          // low tier over high tier
          || (a.spider.articleSource.tier !== b.spider.articleSource.tier
            ? a.spider.articleSource.tier > b.spider.articleSource.tier ? 1 : -1
            : 0
          )
          // sitemap spider over crawl spider
          || (
            a.spider.kind !== b.spider.kind
              ? a.spider.kind === 'crawl' ? 1 : -1
              : 0
          )
          // high reach over low reach
          || (
            a.spider.articleSource.reach !== b.spider.articleSource.reach
              ? a.spider.articleSource.reach < b.spider.articleSource.reach ? 1 : -1
              : 0
          )
          // name alphabetic order
          || (
            a.spider.name !== b.spider.name
              ? a.spider.name > b.spider.name ? 1 : -1
              : 0
          );
      }
    );

    // Schedule jobs

    // Find slot with free space as close as possible to the optimum required offset
    const findClosestFreeSlot = (item: QueueItem): ScheduleSlot => {

      const optimumScheduleUtcHour = item.optimumScheduleUtcHour;

      for (let i = 0; i < 24; i++) {
        const utcHour = repeatValue(optimumScheduleUtcHour + i, 24);
        const slot = schedule[utcHour];
        const isSlotFree = slot.loadHs + item.avgRunTimeHs <= slot.capacityHs;

        if (!isSlotFree) {
          continue;
        }
        return slot;
      }
      // Could not find a free slot --> return the optimum one.
      return schedule[optimumScheduleUtcHour];
    }

    queue.forEach(item => {
      const slot = findClosestFreeSlot(item);
      slot.scheduledItems.push(item);
      slot.loadHs += item.avgRunTimeHs;
    });

    // Display results
    if (displayResults) {
      this.printScheduleStats(schedule);

      for (let utcHour = 0; utcHour < 24; utcHour++) {
        const slot = schedule[repeatValue(utcHour, 24)];

        console.log({
          utc_hour: utcHour,
          load_hs: slot.loadHs.toFixed(4),
        });
        console.table(
          slot.scheduledItems.map(i => ({
            name: i.spider.name,
            parse_categ: i.spider.articleSource?.parseCategory,
            tier: i.spider.articleSource?.tier,
            opt_utc_hour: i.optimumScheduleUtcHour,
            delta: repeatValue(utcHour - i.optimumScheduleUtcHour, 24),
          }))
        );
      }
    }

    return schedule;
  }


  private getSpiderBaseUtcRunHour(spider: ArticleSpiderWithRelations) {
    const countryCode = spider.name.substr(0, 2) as CountryCode;
    return repeatValue(-UTC_INFO_COUNTRY[countryCode].offsetMin, 24);
  }


  private getSitemapSpiderUtcRunHours(parseCategory: 'full' | 'base', baseUtcRunHour: number) {
    return SITEMAP_SPIDER_SCHEDULE_RELATIVE_HOURS[parseCategory].map(
      rh => repeatValue(baseUtcRunHour + rh, 24)
    );
  }


  private getSpiderAvgRunTime(spider: ArticleSpiderWithRelations) {
    const parseCategory = spider.articleSource?.parseCategory === 'full' ? 'full' : 'base';
    const kind = spider.kind === 'crawl' ? 'crawl' : 'sitemap';

    return SPIDER_AVG_RUN_TIME_HS[parseCategory][kind];
  }


  private printScheduleStats(schedule: { [utcHour: number]: ScheduleSlot }) {

    const calcStats = (
      items: { optimumUtcHour: number; scheduledUtcHour: number; }[]
    ): {
      avgDelta: number | null,
      minDelta: number | null,
      maxDelta: number | null
    } => {
      if (items.length === 0) {
        return ({ avgDelta: null, minDelta: null, maxDelta: null });
      }

      const firstItemDelta = repeatValue(items[0].scheduledUtcHour - items[0].optimumUtcHour, 24);
      let minDelta = firstItemDelta;
      let maxDelta = firstItemDelta;
      let sumDelta = 0;

      items.forEach(i => {
        const delta = repeatValue(i.scheduledUtcHour - i.optimumUtcHour, 24);
        sumDelta += delta;
        minDelta = (delta < minDelta) ? delta : minDelta;
        maxDelta = (delta > maxDelta) ? delta : maxDelta;
      });

      const avgDelta = sumDelta / items.length;
      return ({ avgDelta, minDelta, maxDelta });
    }

    const allItems: { utcHour: number; qi: QueueItem }[] = [];
    Object.keys(schedule).forEach(utcHour => {
      const utcH = parseInt(utcHour);
      const slot = schedule[utcH];
      allItems.push(...slot.scheduledItems.map(qi => ({ utcHour: utcH, qi })));
    });

    console.log('Schedule stats: -----------------------------------------------')
    console.log('');

    const totalLoad = Object.values(schedule).reduce((sumHs, slot) => {
      return sumHs + slot.loadHs
    }, 0) / PARALLEL_SCRAPYD_JOBS / 24 * 100.0;

    console.log(`Total load: ${totalLoad.toFixed(1)}%`);
    console.log('');

    const rows = [];

    for (let kind of ['crawl', 'sitemap']) {
      for (let parseCategory of ['full', 'base']) {
        for (let tier of [1, 2, 3]) {

          const items = allItems.filter(i =>
            i.qi.spider.kind === kind
            && i.qi.spider.articleSource?.parseCategory === parseCategory
            && i.qi.spider.articleSource?.tier === tier
          ).map(i => ({
            optimumUtcHour: i.qi.optimumScheduleUtcHour,
            scheduledUtcHour: i.utcHour,
          }));
          const stats = calcStats(items);

          rows.push({
            kind,
            parse_category: parseCategory,
            tier,
            avg_delta: stats.avgDelta?.toFixed(3),
            min_delta: stats.minDelta?.toFixed(3),
            max_delta: stats.maxDelta?.toFixed(3)
          })
        }
      }
    }
    console.table(rows);
  }

}
