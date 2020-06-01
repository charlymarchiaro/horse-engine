import { Entity, model, property, belongsTo } from '@loopback/repository';
import { ArticleSpider, ArticleSpiderWithRelations } from './article-spider.model';
import { Article, ArticleWithRelations } from './article.model';

@model({
  settings: {
    postgresql: {
      schema: 'scraper',
      table: 'article_scraping_details'
    },
    foreignKeys: {
      fkArticleScrapingDetailsArticleSpider: {
        name: 'fk__article_scraping_details__article_spider',
        entity: 'ArticleSpider',
        entityKey: 'id',
        foreignKey: 'spider_id',
      },
      fkArticleScrapingDetailsArticle: {
        name: 'fk__article_scraping_details__article',
        entity: 'Article',
        entityKey: 'id',
        foreignKey: 'article_id',
      },
    },
  },
})
export class ArticleScrapingDetails extends Entity {
  @property({
    type: 'string',
    id: true,
    required: false,
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      columnName: 'id',
      dataType: 'bigint',
      nullable: 'NO',
    },
  })
  id?: number;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'scraped_at',
      dataType: 'timestamp with time zone',
      dataLength: null,
      nullable: 'NO',
    },
  })
  scrapedAt: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'parse_function',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'YES',
    },
  })
  parseFunction?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'result',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  result: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'error',
      dataType: 'text',
      dataLength: null,
      nullable: 'YES',
    },
  })
  error?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'error_details',
      dataType: 'text',
      dataLength: null,
      nullable: 'YES',
    },
  })
  errorDetails?: string;

  @belongsTo(() => ArticleSpider, {}, {
    type: 'number',
    generated: true,
    postgresql: {
      columnName: 'spider_id',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  spiderId: number;

  @belongsTo(() => Article, {}, {
    type: 'number',
    generated: true,
    postgresql: {
      columnName: 'article_id',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  articleId: number;

  constructor(data?: Partial<ArticleScrapingDetails>) {
    super(data);
  }
}

export interface ArticleScrapingDetailsRelations {
  spider?: ArticleSpiderWithRelations;
  article?: ArticleWithRelations;
}

export type ArticleScrapingDetailsWithRelations = ArticleScrapingDetails & ArticleScrapingDetailsRelations;
