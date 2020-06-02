import { ArticleSource, ArticleSourceResponse } from './article-source.model';


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
