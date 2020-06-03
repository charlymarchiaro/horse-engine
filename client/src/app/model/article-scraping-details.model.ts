import { ArticleSpider, ArticleSpiderResponse } from './article-spider.model';
import { Article, ArticleResponse } from './article.model';



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
