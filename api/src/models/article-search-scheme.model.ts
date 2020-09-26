import {Entity, model, property} from '@loopback/repository';

@model({
  settings: {
    postgresql: { schema: 'search', table: 'article_search_scheme' },
  },
})
export class ArticleSearchScheme extends Entity {
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
      dataLength: 256,
      nullable: 'NO',
    }
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'description',
      dataType: 'TEXT',
      nullable: 'YES',
    }
  })
  description: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'version',
      dataType: 'VARCHAR',
      dataLength: 256,
      nullable: 'NO',
    }
  })
  version: string;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'created_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  createdAt: Date;

  @property({
    type: 'date',
    required: false,
    postgresql: {
      columnName: 'updated_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  updatedAt: Date;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'scheme',
      dataType: 'JSON',
      nullable: 'NO',
    }
  })
  scheme: string;


  constructor(data?: Partial<ArticleSearchScheme>) {
    super(data);
  }
}

export interface ArticleSearchSchemeRelations {
  // describe navigational properties here
}

export type ArticleSearchSchemeWithRelations = ArticleSearchScheme & ArticleSearchSchemeRelations;
