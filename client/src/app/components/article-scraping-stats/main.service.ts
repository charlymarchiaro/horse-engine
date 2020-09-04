import { Injectable } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ArticleScrapingStatsFull, ArticleScrapingStats } from '../../model/article.model';
import { LoadStateHandler } from '../../services/utils/load-status';
import { PsrDataRow, SscdDataRow, PsddDataRow, GlobalDataRow, Consts, DeviationLevel, StatAggr, PsddCategory } from './model';
import { isNullOrUndefined } from 'util';


@Injectable({
  providedIn: 'root'
})
export class MainService {


  private backendSubscription = new Subscription();

  private statsSubject = new BehaviorSubject<ArticleScrapingStatsFull>(null);
  public stats$ = this.statsSubject.asObservable();

  private loadState = new LoadStateHandler();
  public loadState$ = this.loadState.state$;

  // PSR
  private sourcePsrDataSubject = new BehaviorSubject<PsrDataRow[]>([]);
  public sourcePsrData$ = this.sourcePsrDataSubject.asObservable();

  // SSCD
  private sourceSscdDataSubject = new BehaviorSubject<SscdDataRow[]>([]);
  public sourceSscdData$ = this.sourceSscdDataSubject.asObservable();

  // PSDD
  private sourcePsddDataSubject = new BehaviorSubject<PsddDataRow[]>([]);
  public sourcePsddData$ = this.sourcePsddDataSubject.asObservable();

  // Global
  private globalDataSubject = new BehaviorSubject<GlobalDataRow>(null);
  public globalData$ = this.globalDataSubject.asObservable();


  constructor(
    private backendService: BackendService,
  ) {
    this.requestData();
  }


  public requestData() {

    this.backendSubscription.unsubscribe();

    this.loadState.startLoad();

    this.backendSubscription = this.backendService.getArticleStatsFull().subscribe(
      response => this.onBackendResponseSuccess(response),
      error => this.onBackendResponseError(error),
    );
  }


  private onBackendResponseSuccess(stats: ArticleScrapingStatsFull) {

    this.statsSubject.next(stats);
    this.loadState.loadSuccess();

    // PSR
    this.sourcePsrDataSubject.next(
      this.processPsrData(stats.sources)
    );

    // SSCD
    this.sourceSscdDataSubject.next(
      this.processSscdData(stats.sources)
    );

    // PSDD
    this.sourcePsddDataSubject.next(
      this.processPsddData(stats.sources)
    );

    // Global
    this.globalDataSubject.next(
      this.processGlobalData(stats.total)
    );
  }


  private onBackendResponseError(error) {
    this.statsSubject.next(null);
    this.loadState.loadError(error.message);
  }


  private processPsrData(stats: ArticleScrapingStats[]): PsrDataRow[] {

    const data: PsrDataRow[] = stats.map(s => {

      const devLvlH = this.calcPsrDevLevel('H', s);
      const devLvl1w = this.calcPsrDevLevel('1W', s);

      return ({
        sourceName: s.articleSource.name,
        parseCategory: s.articleSource.parseCategory,

        // H
        valH: isNullOrUndefined(s.psr_h) ? '—' : s.psr_h.toFixed(1),
        devLvlH,

        // 1W
        val1w: isNullOrUndefined(s.psr_1w) ? '—' : s.psr_1w.toFixed(1),
        devLvl1w,

        // Trend
        valTrend: (
          isNullOrUndefined(s.psr_h)
          || isNullOrUndefined(s.psr_1w)
        ) ? '—'
          : (100 * (s.psr_1w - s.psr_h) / s.psr_h).toFixed(1),

        trendSign: (
          isNullOrUndefined(s.psr_h)
          || isNullOrUndefined(s.psr_1w)
        ) ? 0 : (s.psr_1w > s.psr_h) ? 1 : -1,

        // Degradation level
        valDL: this.calcDegradationLevel([devLvlH, devLvl1w], s),
        dli: 0,
      });
    });

    // Set degradation levels indices
    data.sort((a, b) => b.valDL - a.valDL);
    return data.map((r, i) => ({ ...r, dli: i + 1 }));
  }


  private processSscdData(stats: ArticleScrapingStats[]): SscdDataRow[] {

    const data: SscdDataRow[] = stats.map(s => {

      const devLvlH = this.calcSscdDevLevel('H', s);
      const devLvl1w = this.calcSscdDevLevel('1W', s);

      return ({
        sourceName: s.articleSource.name,
        parseCategory: s.articleSource.parseCategory,

        // H
        valH: isNullOrUndefined(s.sscd_h) ? '—' : s.sscd_h.toFixed(1),
        devLvlH,

        // 1W
        val1w: isNullOrUndefined(s.sscd_1w) ? '—' : s.sscd_1w.toFixed(1),
        devLvl1w,

        // Trend
        valTrend: (
          isNullOrUndefined(s.sscd_h)
          || isNullOrUndefined(s.sscd_1w)
        ) ? '—'
          : (100 * (s.sscd_1w - s.sscd_h) / s.sscd_h).toFixed(1),

        trendSign: (
          isNullOrUndefined(s.sscd_h)
          || isNullOrUndefined(s.sscd_1w)
        ) ? 0 : (s.sscd_1w > s.sscd_h) ? 1 : -1,

        // Degradation level
        valDL: this.calcDegradationLevel([devLvlH, devLvl1w], s),
        dli: 0,
      });
    });

    // Set degradation levels indices
    data.sort((a, b) => b.valDL - a.valDL);
    return data.map((r, i) => ({ ...r, dli: i + 1 }));
  }


  private processPsddData(stats: ArticleScrapingStats[]): PsddDataRow[] {

    const data: PsddDataRow[] = stats.map(s => {

      const devLvlHC1 = this.calcPsddDevLevel('H', 'c1', s);
      const devLvl1wC1 = this.calcPsddDevLevel('1W', 'c1', s);
      const devLvlHC2 = this.calcPsddDevLevel('H', 'c2', s);
      const devLvl1wC2 = this.calcPsddDevLevel('1W', 'c2', s);
      const devLvlHC3 = this.calcPsddDevLevel('H', 'c3', s);
      const devLvl1wC3 = this.calcPsddDevLevel('1W', 'c3', s);

      return ({
        sourceName: s.articleSource.name,
        parseCategory: s.articleSource.parseCategory,

        // H
        valHC1: isNullOrUndefined(s.psddc1_h) ? '—' : s.psddc1_h.toFixed(1),
        valHC2: isNullOrUndefined(s.psddc2_h) ? '—' : s.psddc2_h.toFixed(1),
        valHC3: isNullOrUndefined(s.psddc2_h) ? '—' : s.psddc3_h.toFixed(1),
        devLvlHC1,
        devLvlHC2,
        devLvlHC3,

        // 1W
        val1wC1: isNullOrUndefined(s.psddc1_1w) ? '—' : s.psddc1_1w.toFixed(1),
        val1wC2: isNullOrUndefined(s.psddc2_1w) ? '—' : s.psddc2_1w.toFixed(1),
        val1wC3: isNullOrUndefined(s.psddc3_1w) ? '—' : s.psddc3_1w.toFixed(1),
        devLvl1wC1,
        devLvl1wC2,
        devLvl1wC3,

        // Trend
        valTrendC1: (
          isNullOrUndefined(s.psddc1_h)
          || isNullOrUndefined(s.psddc1_1w)
        ) ? '—'
          : (100 * (s.psddc1_1w - s.psddc1_h) / s.psddc1_h).toFixed(1),

        valTrendC2: (
          isNullOrUndefined(s.psddc2_h)
          || isNullOrUndefined(s.psddc2_1w)
        ) ? '—'
          : (100 * (s.psddc2_1w - s.psddc2_h) / s.psddc2_h).toFixed(1),

        valTrendC3: (
          isNullOrUndefined(s.psddc3_h)
          || isNullOrUndefined(s.psddc3_1w)
        ) ? '—'
          : (100 * (s.psddc3_1w - s.psddc3_h) / s.psddc3_h).toFixed(1),

        trendSignC1: (
          isNullOrUndefined(s.psddc1_h)
          || isNullOrUndefined(s.psddc1_1w)
        ) ? 0 : (s.psddc1_1w > s.psddc1_h) ? 1 : -1,

        trendSignC2: (
          isNullOrUndefined(s.psddc2_h)
          || isNullOrUndefined(s.psddc2_1w)
        ) ? 0 : (s.psddc2_1w > s.psddc2_h) ? -1 : 1,

        trendSignC3: (
          isNullOrUndefined(s.psddc3_h)
          || isNullOrUndefined(s.psddc3_1w)
        ) ? 0 : (s.psddc3_1w > s.psddc3_h) ? -1 : 1,

        // Degradation level
        valDL: this.calcDegradationLevel(
          [devLvlHC1, devLvlHC2, devLvlHC3, devLvl1wC1, devLvl1wC2, devLvl1wC3], s
        ),
        dli: 0,
      });
    });

    // Set degradation levels indices
    data.sort((a, b) => b.valDL - a.valDL);
    return data.map((r, i) => ({ ...r, dli: i + 1 }));
  }


  private processGlobalData(stats: ArticleScrapingStats): GlobalDataRow {

    stats = {
      ...stats,
      articleSource: {
        id: null,
        name: 'total',
        country: null,
        region: null,
        redCircle: null,
        url: null,
        tier: null,
        reach: null,
        adValue500: null,
        adValue150: null,
        parseCategory: 'full',
      }
    };

    let psrData = this.processPsrData([stats]);
    let sscdData = this.processSscdData([stats]);
    let psddData = this.processPsddData([stats]);

    psrData = (psrData && psrData.length > 0) ? psrData : [];
    sscdData = (sscdData && sscdData.length > 0) ? sscdData : [];
    psddData = (psddData && psddData.length > 0) ? psddData : [];

    return {
      psr: psrData[0],
      sscd: sscdData[0],
      psdd: psddData[0],
    };
  }


  private calcPsrDevLevel(
    statAggr: StatAggr,
    stats: ArticleScrapingStats
  ): DeviationLevel {

    let minThresAbs;
    let majThresAbs;
    let minThresRelH;
    let majThresRelH;
    let val;
    const H = stats.psr_h;

    // H
    if (statAggr === 'H') {

      val = stats.psr_h;
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.psr.vH.minDev.full.abs;
        majThresAbs = Consts.psr.vH.majDev.full.abs;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.psr.vH.minDev.base.abs;
        majThresAbs = Consts.psr.vH.majDev.base.abs;
      }

      return (
        val < majThresAbs
          ? DeviationLevel.major
          : val < minThresAbs
            ? DeviationLevel.minor
            : DeviationLevel.none
      );

      // 1W
    } else if (statAggr === '1W') {

      val = stats.psr_1w;
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.psr.v1w.minDev.full.abs;
        majThresAbs = Consts.psr.v1w.majDev.full.abs;
        minThresRelH = Consts.psr.v1w.minDev.full.relH;
        majThresRelH = Consts.psr.v1w.majDev.full.relH;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.psr.v1w.minDev.base.abs;
        majThresAbs = Consts.psr.v1w.majDev.base.abs;
        minThresRelH = Consts.psr.v1w.minDev.base.relH;
        majThresRelH = Consts.psr.v1w.majDev.base.relH;
      }

      return (
        val < majThresAbs || val < majThresRelH / 100.0 * H
          ? DeviationLevel.major
          : val < minThresAbs || val < minThresRelH / 100.0 * H
            ? DeviationLevel.minor
            : DeviationLevel.none
      );
    }
  }


  private calcSscdDevLevel(
    statAggr: StatAggr,
    stats: ArticleScrapingStats
  ): DeviationLevel {

    let minThresAbs;
    let majThresAbs;
    let minThresRelH;
    let majThresRelH;
    let val;
    const H = stats.sscd_h;

    // H
    if (statAggr === 'H') {

      val = stats.sscd_h;
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.sscd.vH.minDev.full.abs;
        majThresAbs = Consts.sscd.vH.majDev.full.abs;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.sscd.vH.minDev.base.abs;
        majThresAbs = Consts.sscd.vH.majDev.base.abs;
      }

      return (
        val < majThresAbs
          ? DeviationLevel.major
          : val < minThresAbs
            ? DeviationLevel.minor
            : DeviationLevel.none
      );

      // 1W
    } else if (statAggr === '1W') {

      val = stats.sscd_1w;
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.sscd.v1w.minDev.full.abs;
        majThresAbs = Consts.sscd.v1w.majDev.full.abs;
        minThresRelH = Consts.sscd.v1w.minDev.full.relH;
        majThresRelH = Consts.sscd.v1w.majDev.full.relH;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.sscd.v1w.minDev.base.abs;
        majThresAbs = Consts.sscd.v1w.majDev.base.abs;
        minThresRelH = Consts.sscd.v1w.minDev.base.relH;
        majThresRelH = Consts.sscd.v1w.majDev.base.relH;
      }

      return (
        val < majThresAbs || val < majThresRelH / 100.0 * H
          ? DeviationLevel.major
          : val < minThresAbs || val < minThresRelH / 100.0 * H
            ? DeviationLevel.minor
            : DeviationLevel.none
      );
    }
  }


  private calcPsddDevLevel(
    statAggr: StatAggr,
    psddCategory: PsddCategory,
    stats: ArticleScrapingStats
  ): DeviationLevel {

    let minThresAbs;
    let majThresAbs;
    let minThresRelH;
    let majThresRelH;
    let val;
    const H = stats[`psdd${psddCategory}_h`];
    const sign = psddCategory === 'c1' ? 1 : -1;

    // H
    if (statAggr === 'H') {

      val = stats[`psdd${psddCategory}_h`];
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.psdd.vH[psddCategory].minDev.full.abs;
        majThresAbs = Consts.psdd.vH[psddCategory].majDev.full.abs;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.psdd.vH[psddCategory].minDev.base.abs;
        majThresAbs = Consts.psdd.vH[psddCategory].majDev.base.abs;
      }

      return (
        sign * val < sign * majThresAbs
          ? DeviationLevel.major
          : sign * val < sign * minThresAbs
            ? DeviationLevel.minor
            : DeviationLevel.none
      );

      // 1W
    } else if (statAggr === '1W') {

      val = stats[`psdd${psddCategory}_1w`];
      if (isNullOrUndefined(val) || isNullOrUndefined(H)) {
        return DeviationLevel.none;
      }

      if (stats.articleSource.parseCategory === 'full') {
        minThresAbs = Consts.psdd.v1w[psddCategory].minDev.full.abs;
        majThresAbs = Consts.psdd.v1w[psddCategory].majDev.full.abs;
        minThresRelH = Consts.psdd.v1w[psddCategory].minDev.full.relH;
        majThresRelH = Consts.psdd.v1w[psddCategory].majDev.full.relH;

      } else if (stats.articleSource.parseCategory === 'base') {
        minThresAbs = Consts.psdd.v1w[psddCategory].minDev.base.abs;
        majThresAbs = Consts.psdd.v1w[psddCategory].majDev.base.abs;
        minThresRelH = Consts.psdd.v1w[psddCategory].minDev.base.relH;
        majThresRelH = Consts.psdd.v1w[psddCategory].majDev.base.relH;
      }

      return (
        sign * val < sign * majThresAbs
          || sign * val < sign * majThresRelH / 100.0 * H
          ? DeviationLevel.major
          : sign * val < sign * minThresAbs
            || sign * val < sign * minThresRelH / 100.0 * H
            ? DeviationLevel.minor
            : DeviationLevel.none
      );
    }
  }


  private calcDegradationLevel(dls: DeviationLevel[], stats: ArticleScrapingStats): number {

    // DL = (kMin x MinDevCount + kMaj x MajDevCount) x (1 + kSscdh) x SSCD-H
    return dls.reduce(
      (sum, i) => {
        return i === DeviationLevel.major
          ? sum + Consts.dl.kMaj * (1 + Consts.dl.kSscdh * stats.sscd_h)
          : i === DeviationLevel.minor
            ? sum + Consts.dl.kMin * (1 + Consts.dl.kSscdh * stats.sscd_h)
            : sum;
      }, 0
    );
  }
}
