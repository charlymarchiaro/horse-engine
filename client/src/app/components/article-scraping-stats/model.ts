export type ParseCategory = 'base' | 'full';
export type StatAggr = 'H' | '1W';
export type PsddCategory = 'c1' | 'c2' | 'c3';

export const Consts = {
  // DL
  dl: {
    kMin: 1,
    kMaj: 2.5,
    kSscdh: 0.5,
  },

  // PSR
  psr: {
    vH: {
      minDev: { full: { abs: 99 }, base: { abs: 95 }, },
      majDev: { full: { abs: 98 }, base: { abs: 90 }, },
    },
    v1w: {
      minDev: { full: { abs: 99, relH: 70 }, base: { abs: 95, relH: 70 }, },
      majDev: { full: { abs: 98, relH: 50 }, base: { abs: 90, relH: 50 }, },
    },
  },

  // SSCD
  sscd: {
    vH: {
      minDev: { full: { abs: 10 }, base: { abs: 2 }, },
      majDev: { full: { abs: 5 }, base: { abs: 1 }, },
    },
    v1w: {
      minDev: { full: { abs: 10, relH: 70 }, base: { abs: 2, relH: 70 }, },
      majDev: { full: { abs: 5, relH: 50 }, base: { abs: 1, relH: 50 }, },
    },
  },

  // PSDD
  psdd: {
    vH: {
      c1: {
        minDev: { full: { abs: 50 }, base: { abs: 50 }, },
        majDev: { full: { abs: 25 }, base: { abs: 25 }, },
      },
      c2: {
        minDev: { full: { abs: 20 }, base: { abs: 20 }, },
        majDev: { full: { abs: 50 }, base: { abs: 50 }, },
      },
      c3: {
        minDev: { full: { abs: 15 }, base: { abs: 15 }, },
        majDev: { full: { abs: 30 }, base: { abs: 30 }, },
      },
    },
    v1w: {
      c1: {
        minDev: { full: { abs: 50, relH: 70 }, base: { abs: 50, relH: 70 }, },
        majDev: { full: { abs: 25, relH: 50 }, base: { abs: 25, relH: 50 }, },
      },
      c2: {
        minDev: { full: { abs: 20, relH: 130 }, base: { abs: 20, relH: 130 }, },
        majDev: { full: { abs: 50, relH: 150 }, base: { abs: 50, relH: 150 }, },
      },
      c3: {
        minDev: { full: { abs: 15, relH: 130 }, base: { abs: 15, relH: 130 }, },
        majDev: { full: { abs: 30, relH: 150 }, base: { abs: 30, relH: 150 }, },
      },
    },
  },
};

export enum DeviationLevel {
  none = 'NONE',
  minor = 'MINOR',
  major = 'MAJOR',
}

export type TrendSign = -1 | 0 | 1;

export interface PsrDataRow {
  sourceName: string;
  parseCategory: string;

  // H
  valH: string;
  devLvlH: DeviationLevel;

  // 1W
  val1w: string;
  devLvl1w: DeviationLevel;

  // Trend
  valTrend: string;
  trendSign: TrendSign;

  // Degradation Level
  valDL: number;
  dli: number;
}

export interface SscdDataRow {
  sourceName: string;
  parseCategory: string;

  // H
  valH: string;
  devLvlH: DeviationLevel;

  // 1W
  val1w: string;
  devLvl1w: DeviationLevel;

  // Trend
  valTrend: string;
  trendSign: TrendSign;

  // Degradation Level
  valDL: number;
  dli: number;
}

export interface PsddDataRow {
  sourceName: string;
  parseCategory: string;

  // H
  valHC1: string;
  valHC2: string;
  valHC3: string;
  devLvlHC1: DeviationLevel;
  devLvlHC2: DeviationLevel;
  devLvlHC3: DeviationLevel;

  // 1W
  val1wC1: string;
  val1wC2: string;
  val1wC3: string;
  devLvl1wC1: DeviationLevel;
  devLvl1wC2: DeviationLevel;
  devLvl1wC3: DeviationLevel;

  // Trend
  valTrendC1: string;
  valTrendC2: string;
  valTrendC3: string;
  trendSignC1: TrendSign;
  trendSignC2: TrendSign;
  trendSignC3: TrendSign;

  // Degradation Level
  valDL: number;
  dli: number;
}

export interface GlobalDataRow {
  psr: PsrDataRow;
  sscd: SscdDataRow;
  psdd: PsddDataRow;
}
