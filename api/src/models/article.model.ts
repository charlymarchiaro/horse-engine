import { Entity, model, property, belongsTo } from '@loopback/repository';
import { ArticleSource, ArticleSourceWithRelations } from './article-source.model';
import { ArticleSpider, ArticleSpiderWithRelations } from './article-spider.model';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article' },
    foreignKeys: {
      fk__article__article_source: {
        name: 'fk__article__article_source',
        entity: 'ArticleSource',
        entityKey: 'id',
        foreignKey: 'article_source_id',
      },
      fk__article__article_spider: {
        name: 'fk__article__article_spider',
        entity: 'ArticleSpider',
        entityKey: 'id',
        foreignKey: 'article_spider_id',
      },
    },
  },
})
export class Article extends Entity {
  @property({
    type: 'number',
    required: false,
    id: true,
    postgresql: {
      columnName: 'id',
      // 64 bits
      dataType: 'BIGSERIAL',
    },
  })
  id?: number;

  @property({
    type: 'string',
    index: true,
    required: true,
    postgresql: {
      columnName: 'url',
      dataType: 'TEXT',
      nullable: 'NO',
    }
  })
  url: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'title',
      dataType: 'TEXT',
      nullable: 'YES',
    }
  })
  title?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'text',
      dataType: 'TEXT',
      nullable: 'YES',
    }
  })
  text?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'last_updated',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  lastUpdated?: string;

  @property({
    type: 'date',
    index: true,
    postgresql: {
      columnName: 'date',
      dataType: 'DATE',
      nullable: 'YES',
    }
  })
  date?: string;

  @belongsTo(() => ArticleSource, {}, {
    postgresql: {
      columnName: 'article_source_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleSourceId: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'scraped_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
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
    postgresql: {
      columnName: 'result',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  result: string;

  @belongsTo(() => ArticleSpider, {}, {
    postgresql: {
      columnName: 'article_spider_id',
      dataType: 'uuid',
      nullable: 'YES',
    }
  })
  articleSpiderId: string;

  @property({
    type: 'boolean',
    postgresql: {
      columnName: 'is_duplicate',
      dataType: 'BOOLEAN',
      nullable: 'YES',
    }
  })
  isDuplicate?: boolean;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'original_article_id',
      dataType: 'BIGINT',
    }
  })
  originalArticleId?: number;

  constructor(data?: Partial<Article>) {
    super(data);
  }
}

export interface ArticleRelations {
  articleSource?: ArticleSourceWithRelations;
  articleSpider?: ArticleSpiderWithRelations;
}

export type ArticleWithRelations = Article & ArticleRelations;
