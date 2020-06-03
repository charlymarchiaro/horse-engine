import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository';
import { ArticleSource, ArticleSourceWithRelations } from './article-source.model';
import { ArticleScrapingDetails } from './article-scraping-details.model';

@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_spider' },
    foreignKeys: {
      fk__article_spider__article_source: {
        name: 'fk__article_spider__article_source',
        entity: 'ArticleSource',
        entityKey: 'id',
        foreignKey: 'article_source_id',
      },
    },
  },
})
export class ArticleSpider extends Entity {
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
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'name',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'kind',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  kind: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'parse_category',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  parseCategory: string;

  @belongsTo(() => ArticleSource, {}, {
    postgresql: {
      columnName: 'article_source_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleSourceId: string;

  @hasMany(() => ArticleScrapingDetails)
  articleScrapingDetails: ArticleScrapingDetails[];

  constructor(data?: Partial<ArticleSpider>) {
    super(data);
  }
}

export interface ArticleSpiderRelations {
  articleSource?: ArticleSourceWithRelations;
}

export type ArticleSpiderWithRelations = ArticleSpider & ArticleSpiderRelations;
