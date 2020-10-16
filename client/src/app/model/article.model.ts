
/**
 * Article source
 */

export class ArticleSource {
  id: string;
  name: string;
  country: string;
  region: string;
  redCircle: boolean;
  url: string;
  tier: number;
  reach: number;
  adValue500: number;
  adValue150: number;
  parseCategory: string;

  constructor(r: ArticleSourceResponse) {
    this.id = r.id;
    this.name = r.name;
    this.country = r.country;
    this.region = r.region;
    this.redCircle = r.redCircle;
    this.url = r.url;
    this.tier = parseInt(r.tier, 10);
    this.reach = parseInt(r.reach, 10);
    this.adValue500 = parseInt(r.adValue500, 10);
    this.adValue150 = parseInt(r.adValue150, 10);
    this.parseCategory = r.parseCategory || 'full';
  }
}


export interface ArticleSourceResponse {
  id: string;
  name: string;
  country: string;
  region: string;
  redCircle: boolean;
  url: string;
  tier: string;
  reach: string;
  adValue500: string;
  adValue150: string;
  parseCategory?: string;
}



/**
 * Article Summary
 */

export class ArticleSummary {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: Date;
  sourceName: string;
  scrapedAt: Date;
  parseFunction?: string;
  result: string;
  spiderName: string;

  constructor(r: ArticleSummaryResponse) {
    this.id = r.id;
    this.url = r.url;
    this.title = r.title;
    this.text = r.text;
    this.lastUpdated = r.lastUpdated ? new Date(r.lastUpdated) : null;
    this.sourceName = r.sourceName;
    this.scrapedAt = r.scrapedAt ? new Date(r.scrapedAt) : null;
    this.parseFunction = r.parseFunction;
    this.result = r.result;
    this.spiderName = r.spiderName;
  }
}


export interface ArticleSummaryResponse {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: string;
  sourceName: string;
  scrapedAt: string;
  parseFunction?: string;
  result: string;
  spiderName: string;
}



/**
 * Article
 */

export class Article {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: Date;
  date?: Date;
  scrapedAt: Date;
  parseFunction?: string;
  result: string;
  articleSourceId: string;
  articleSource?: ArticleSource;
  articleSpiderId: string;
  articleSpider?: ArticleSpider;

  constructor(r: ArticleResponse) {
    this.id = r.id;
    this.url = r.url;
    this.title = r.title;
    this.text = r.text;
    this.lastUpdated = r.lastUpdated ? new Date(r.lastUpdated) : null;
    this.date = r.date ? new Date(r.date) : null;
    this.scrapedAt = r.scrapedAt ? new Date(r.scrapedAt) : null;
    this.parseFunction = r.parseFunction;
    this.result = r.result;
    this.articleSourceId = r.articleSourceId;
    this.articleSource = r.articleSource ? new ArticleSource(r.articleSource) : null;
    this.articleSpiderId = r.articleSpiderId;
    this.articleSpider = r.articleSpider ? new ArticleSpider(r.articleSpider) : null;
  }
}


export interface ArticleResponse {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: string;
  date?: string;
  scrapedAt: string;
  parseFunction?: string;
  result: string;
  articleSourceId: string;
  articleSource?: ArticleSourceResponse;
  articleSpiderId: string;
  articleSpider?: ArticleSpiderResponse;
}



/**
 * Article spider
 */

export class ArticleSpider {
  id: string;
  name: string;
  kind: string;
  articleSourceId: string;
  articleSource?: ArticleSource;

  constructor(r: ArticleSpiderResponse) {
    this.id = r.id;
    this.name = r.name;
    this.kind = r.kind;
    this.articleSourceId = r.articleSourceId;
    this.articleSource = r.articleSource ? new ArticleSource(r.articleSource) : null;
  }
}


export interface ArticleSpiderResponse {
  id: string;
  name: string;
  kind: string;
  articleSourceId: string;
  articleSource?: ArticleSourceResponse;
}


/**
 * Article scraping stats
 */

export class ArticleScrapingStats {
  sourceId: string;
  articleSource?: ArticleSource;
  psr_h?: number;
  psr_1w?: number;
  sscd_h?: number;
  sscd_1w?: number;
  psddc1_h?: number;
  psddc2_h?: number;
  psddc3_h?: number;
  psddc1_1w?: number;
  psddc2_1w?: number;
  psddc3_1w?: number;

  constructor(r: ArticleScrapingStatsResponse) {
    this.sourceId = r.source_id;
    this.articleSource = r.articleSource ? new ArticleSource(r.articleSource) : null;
    this.psr_h = parseFloat(r.psr_h);
    this.psr_1w = parseFloat(r.psr_1w);
    this.sscd_h = parseFloat(r.sscd_h);
    this.sscd_1w = parseFloat(r.sscd_1w);
    this.psddc1_h = parseFloat(r.psddc1_h);
    this.psddc2_h = parseFloat(r.psddc2_h);
    this.psddc3_h = parseFloat(r.psddc3_h);
    this.psddc1_1w = parseFloat(r.psddc1_1w);
    this.psddc2_1w = parseFloat(r.psddc2_1w);
    this.psddc3_1w = parseFloat(r.psddc3_1w);
  }
}


export interface ArticleScrapingStatsResponse {
  source_id: string;
  articleSource?: ArticleSourceResponse;
  psr_h?: string;
  psr_1w?: string;
  sscd_h?: string;
  sscd_1w?: string;
  psddc1_h?: string;
  psddc2_h?: string;
  psddc3_h?: string;
  psddc1_1w?: string;
  psddc2_1w?: string;
  psddc3_1w?: string;
}


export class ArticleScrapingStatsFull {
  sources: ArticleScrapingStats[];
  total: ArticleScrapingStats;

  constructor(r: ArticleScrapingStatsFullResponse) {
    this.sources = r.sources.map(i => new ArticleScrapingStats(i));
    this.total = new ArticleScrapingStats(r.total);
  }
}

export interface ArticleScrapingStatsFullResponse {
  sources: ArticleScrapingStatsResponse[];
  total: ArticleScrapingStatsResponse;
}

