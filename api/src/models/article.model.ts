import { Entity, model, property, belongsTo, hasOne } from '@loopback/repository';
import { ArticleSource, ArticleSourceWithRelations } from './article-source.model';
import { ArticleScrapingDetails } from './article-scraping-details.model';

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
    },
  },
})
export class Article extends Entity {
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

  @hasOne(() => ArticleScrapingDetails)
  articleScrapingDetails: ArticleScrapingDetails;

  constructor(data?: Partial<Article>) {
    super(data);
  }
}

export interface ArticleRelations {
  articleSource?: ArticleSourceWithRelations;
}

export type ArticleWithRelations = Article & ArticleRelations;
