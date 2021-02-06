import { Entity, model, property } from '@loopback/repository';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_id_map' },
  },
})
export class ArticleIdMap extends Entity {
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
    postgresql: {
      columnName: 'uuid',
      dataType: 'uuid',
      nullable: 'NO'
    },
  })
  uuid: string;

  constructor(data?: Partial<ArticleIdMap>) {
    super(data);
  }
}

export interface ArticleIdMapRelations {
}

export type ArticleIdMapWithRelations = ArticleIdMap & ArticleIdMapRelations;