import { Entity, model, property, hasMany } from '@loopback/repository';
import { Article } from './article.model';
import { ArticleSpider } from './article-spider.model';

@model({
  settings: {
    postgresql: {
      schema: 'scraper',
      table: 'article_source'
    },
  }
})
export class ArticleSource extends Entity {
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
      columnName: 'name',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'country',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  country: string;

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
    required: true,
    postgresql: {
      columnName: 'category',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  category: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'tier',
      dataType: 'integer',
      dataLength: null,
      nullable: 'NO',
    },
  })
  tier: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'reach',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  reach: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_base',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  adValueBase: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_500',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  adValue500: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_300',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  adValue300: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_180',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  adValue180: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_100',
      dataType: 'bigint',
      dataLength: null,
      nullable: 'NO',
    },
  })
  adValue100: number;

  @hasMany(() => Article, { keyTo: 'sourceId' })
  articles: Article[];

  @hasMany(() => ArticleSpider, { keyTo: 'sourceId' })
  spiders: ArticleSpider[];

  constructor(data?: Partial<ArticleSource>) {
    super(data);
  }
}

export interface ArticleSourceRelations {
  // describe navigational properties here
}

export type ArticleSourceWithRelations = ArticleSource & ArticleSourceRelations;
