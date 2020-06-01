import { Entity, model, property, belongsTo } from '@loopback/repository';
import { ArticleSource, ArticleSourceWithRelations } from './article-source.model';

@model({
  settings: {
    postgresql: {
      schema: 'scraper',
      table: 'article_spider'
    },
    foreignKeys: {
      fkArticleSpiderArticleSource: {
        name: 'fk__article_spider__article_source',
        entity: 'ArticleSource',
        entityKey: 'id',
        foreignKey: 'source_id',
      },
    },
  },
})
export class ArticleSpider extends Entity {
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
      columnName: 'kind',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  kind: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'parse_category',
      dataType: 'varchar',
      dataLength: 64,
      nullable: 'NO',
    },
  })
  parseCategory: string;

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

  constructor(data?: Partial<ArticleSpider>) {
    super(data);
  }
}

export interface ArticleSpiderRelations {
  source?: ArticleSourceWithRelations;
}

export type ArticleSpiderWithRelations = ArticleSpider & ArticleSpiderRelations;
