
/**
 * Article source
 */

export class ArticleSource {
  id: string;
  name: string;
  country: string;
  url: string;
  category: string;
  tier: number;
  reach: number;
  adValueBase: number;
  adValue500: number;
  adValue300: number;
  adValue180: number;
  adValue100: number;

  constructor(r: ArticleSourceResponse) {
    this.id = r.id;
    this.name = r.name;
    this.country = r.country;
    this.url = r.url;
    this.category = r.category;
    this.tier = parseInt(r.tier, 10);
    this.reach = parseInt(r.reach, 10);
    this.adValueBase = parseInt(r.adValueBase, 10);
    this.adValue500 = parseInt(r.adValue500, 10);
    this.adValue300 = parseInt(r.adValue300, 10);
    this.adValue180 = parseInt(r.adValue180, 10);
    this.adValue100 = parseInt(r.adValue100, 10);
  }
}


export interface ArticleSourceResponse {
  id: string;
  name: string;
  country: string;
  url: string;
  category: string;
  tier: string;
  reach: string;
  adValueBase: string;
  adValue500: string;
  adValue300: string;
  adValue180: string;
  adValue100: string;
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
  articleSourceId: string;
  articleSource?: ArticleSource;
  articleScrapingDetails?: ArticleScrapingDetails;

  constructor(r: ArticleResponse) {
    this.id = r.id;
    this.url = r.url;
    this.title = r.title;
    this.text = r.text;
    this.lastUpdated = r.lastUpdated ? new Date(r.lastUpdated) : null;
    this.articleSourceId = r.articleSourceId;
    this.articleSource = r.articleSource ? new ArticleSource(r.articleSource) : null;
    this.articleScrapingDetails = r.articleScrapingDetails ? new ArticleScrapingDetails(r.articleScrapingDetails) : null;
  }
}


export interface ArticleResponse {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: string;
  articleSourceId: string;
  articleSource?: ArticleSourceResponse;
  articleScrapingDetails?: ArticleScrapingDetailsResponse;
}


export interface ArticleScrapingDetailsResponse {
  id: string;
  scrapedAt: string;
  parseFunction?: string;
  result: string;
  error?: string;
  errorDetails?: string;
  articleSpiderId: string;
  articleId: string;
  articleSpider?: ArticleSpiderResponse;
  article?: ArticleResponse;
}



/**
 * Article spider
 */

export class ArticleSpider {
  id: string;
  name: string;
  kind: string;
  parseCategory: string;
  articleSourceId: string;
  articleSource?: ArticleSource;

  constructor(r: ArticleSpiderResponse) {
    this.id = r.id;
    this.name = r.name;
    this.kind = r.kind;
    this.parseCategory = r.parseCategory;
    this.articleSourceId = r.articleSourceId;
    this.articleSource = r.articleSource ? new ArticleSource(r.articleSource) : null;
  }
}


export interface ArticleSpiderResponse {
  id: string;
  name: string;
  kind: string;
  parseCategory: string;
  articleSourceId: string;
  articleSource?: ArticleSourceResponse;
}



/**
 * Article scraping details
 */

export class ArticleScrapingDetails {
  id: string;
  scrapedAt: Date;
  parseFunction?: string;
  result: string;
  error?: string;
  errorDetails?: string;
  articleSpiderId: string;
  articleId: string;
  articleSpider?: ArticleSpider;
  article?: Article;

  constructor(r: ArticleScrapingDetailsResponse) {
    this.id = r.id;
    this.scrapedAt = new Date(r.scrapedAt);
    this.parseFunction = r.parseFunction;
    this.result = r.result;
    this.error = r.error;
    this.errorDetails = r.errorDetails;
    this.articleSpiderId = r.articleSpiderId;
    this.articleId = r.articleId;
    this.articleSpider = r.articleSpider ? new ArticleSpider(r.articleSpider) : null;
    this.article = r.article ? new Article(r.article) : null;
  }
}


