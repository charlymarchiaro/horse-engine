import { belongsTo, Entity, model, property } from '@loopback/repository';
import { User, UserWithRelations } from './user.model';
import { UserSummaryWithRelations } from './user-summary.model';

@model({
  settings: {
    postgresql: { schema: 'search', table: 'article_search_scheme' },
    foreignKeys: {
      fk__article_search_scheme__user: {
        name: 'fk__article_search_scheme__user',
        entity: 'User',
        entityKey: 'id',
        foreignKey: 'user_id',
      },
    },
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

  @belongsTo(() => User, {}, {
    postgresql: {
      columnName: 'user_id',
      dataType: 'uuid',
      nullable: 'YES',
    }
  })
  userId?: string;

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
    type: 'object',
    required: true,
    postgresql: {
      columnName: 'scheme',
      dataType: 'JSON',
      nullable: 'NO',
    }
  })
  scheme: object;

  @property({
    type: 'boolean',
    required: true,
    default: false,
    postgresql: {
      columnName: 'enabled',
      dataType: 'boolean',
      nullable: 'NO',
    }
  })
  enabled: boolean;


  constructor(data?: Partial<ArticleSearchScheme>) {
    super(data);
  }
}

export interface ArticleSearchSchemeRelations {
  user?: UserSummaryWithRelations;
}

export type ArticleSearchSchemeWithRelations = ArticleSearchScheme & ArticleSearchSchemeRelations;
