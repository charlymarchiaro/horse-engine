import { Entity, model, property } from '@loopback/repository';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_sketch' },
  },
})
export class ArticleSketch extends Entity {
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
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'article_id',
      dataType: 'BIGINT',
      nullable: 'NO',
    }
  })
  articleId?: number;

  @property({
    type: 'number',
    index: true,
    postgresql: {
      columnName: 'hash',
      // 32 bits
      dataType: 'INTEGER',
      nullable: 'NO',
    }
  })
  hash: number;

  @property({
    type: 'date',
    index: true,
    postgresql: {
      columnName: 'date',
      // 32 bits
      dataType: 'DATE',
      nullable: 'NO',
    }
  })
  date: string;

  @property({
    type: 'number',
    index: true,
    postgresql: {
      columnName: 'article_source_id_hash',
      // 16 bits
      dataType: 'SMALLINT',
      nullable: 'NO',
    }
  })
  articleSourceId: number;
}

export interface ArticleSketchRelations {
}

export type ArticleSketchWithRelations = ArticleSketch & ArticleSketchRelations;
