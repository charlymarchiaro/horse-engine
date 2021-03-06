import { Entity, model, property, hasMany } from '@loopback/repository';
import { Article } from './article.model';
import { ArticleSpider } from './article-spider.model';

@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_source' },
  },
})
export class ArticleSource extends Entity {
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
      columnName: 'country',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  country: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'region',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  region: string;

  @property({
    type: 'boolean',
    required: false,
    postgresql: {
      columnName: 'red_circle',
      dataType: 'BOOLEAN',
      nullable: 'YES',
    }
  })
  redCircle: boolean;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'url',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  url: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'tier',
      dataType: 'INTEGER',
      nullable: 'NO',
    }
  })
  tier: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'reach',
      dataType: 'BIGINT',
      nullable: 'NO',
    }
  })
  reach: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'ad_value_500',
      dataType: 'BIGINT',
      nullable: 'NO',
    }
  })
  adValue500: number;

  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'ad_value_150',
      dataType: 'BIGINT',
      nullable: 'YES',
    }
  })
  adValue150: number;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'parse_category',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  parseCategory: string;

  @hasMany(() => Article)
  articles: Article[];

  @hasMany(() => ArticleSpider)
  articleSpiders: ArticleSpider[];

  constructor(data?: Partial<ArticleSource>) {
    super(data);
  }
}

export interface ArticleSourceRelations {
  // describe navigational properties here
}

export type ArticleSourceWithRelations = ArticleSource & ArticleSourceRelations;
