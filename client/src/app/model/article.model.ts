import { ArticleSource, ArticleSourceResponse } from './article-source.model';
import { ArticleScrapingDetails, ArticleScrapingDetailsResponse } from './article-scraping-details.model';



export class Article {
  id: string;
  url: string;
  title?: string;
  text?: string;
  lastUpdated?: Date;
  articleSource?: ArticleSource;
  articleScrapingDetails?: ArticleScrapingDetails;

  constructor(r: ArticleResponse) {
    this.id = r.id;
    this.url = r.url;
    this.title = r.title;
    this.text = r.text;
    this.lastUpdated = r.lastUpdated ? new Date(r.lastUpdated) : null;
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
  articleSource?: ArticleSourceResponse;
  articleScrapingDetails?: ArticleScrapingDetailsResponse;
}






