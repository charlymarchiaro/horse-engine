import { Entity, model, property, belongsTo } from '@loopback/repository';
import { ArticleSpider, ArticleSpiderWithRelations } from './article-spider.model';
import { Article, ArticleWithRelations } from './article.model';

@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_scraping_details' },
    foreignKeys: {
      fk__article_scraping_details__article_spider: {
        name: 'fk__article_scraping_details__article_spider',
        entity: 'ArticleSpider',
        entityKey: 'id',
        foreignKey: 'article_spider_id',
      },
      fk__article_scraping_details__article: {
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
    generated: true,
    useDefaultIdType: false,
    postgresql: {
      columnName: 'id',
      dataType: 'uuid',
    },
  })
  id?: string;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'scraped_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'NO',
    }
  })
  scrapedAt: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'parse_function',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  parseFunction?: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'result',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  result: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'error',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  error?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'error_details',
      dataType: 'TEXT',
      nullable: 'YES',
    }
  })
  errorDetails?: string;

  @belongsTo(() => ArticleSpider, {}, {
    postgresql: {
      columnName: 'article_spider_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleSpiderId: string;

  @belongsTo(() => Article, {}, {
    postgresql: {
      columnName: 'article_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleId: string;

  constructor(data?: Partial<ArticleScrapingDetails>) {
    super(data);
  }
}

export interface ArticleScrapingDetailsRelations {
  articleSpider?: ArticleSpiderWithRelations;
  article?: ArticleWithRelations;
}

export type ArticleScrapingDetailsWithRelations = ArticleScrapingDetails & ArticleScrapingDetailsRelations;
