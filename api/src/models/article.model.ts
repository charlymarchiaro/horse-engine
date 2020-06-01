import { Entity, model, property, belongsTo, hasOne } from '@loopback/repository';
import { ArticleSource, ArticleSourceWithRelations } from './article-source.model';
import { ArticleScrapingDetails } from './article-scraping-details.model';

@model({
  settings: {
    postgresql: {
      schema: 'scraper',
      table: 'article',
    },
    foreignKeys: {
      fkArticleArticleSource: {
        name: 'fk__article__article_source',
        entity: 'ArticleSource',
        entityKey: 'id',
        foreignKey: 'source_id',
      },
    },
  },
})
export class Article extends Entity {
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
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'url',
      dataType: 'text',
      dataLength: null,
      nullable: 'NO',
    },
  })
  url: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'title',
      dataType: 'text',
      dataLength: null,
      nullable: 'YES',
    },
  })
  title?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'text',
      dataType: 'text',
      dataLength: null,
      nullable: 'YES',
    },
  })
  text?: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'last_updated',
      dataType: 'timestamp with time zone',
      dataLength: null,
      nullable: 'YES',
    },
  })
  lastUpdated?: string;

  @belongsTo(() => ArticleSource, {}, {
    type: 'number',
    generated: true,
    postgresql: {
      columnName: 'source_id',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  sourceId: number;

  @hasOne(() => ArticleScrapingDetails)
  scrapingDetails: ArticleScrapingDetails;

  constructor(data?: Partial<Article>) {
    super(data);
  }
}

export interface ArticleRelations {
  source?: ArticleSourceWithRelations;
}

export type ArticleWithRelations = Article & ArticleRelations;
