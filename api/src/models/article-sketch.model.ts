import { Entity, model, property } from '@loopback/repository';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_sketch' },
  },
})
export class ArticleSketch extends Entity {
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
    postgresql: {
      columnName: 'article_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleId: string;

  @property({
    type: 'string',
    index: true,
    postgresql: {
      columnName: 'hash',
      dataType: 'BIGINT',
      nullable: 'NO',
    }
  })
  hash: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'date',
      dataType: 'DATE',
      nullable: 'NO',
    }
  })
  date: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'article_source_id',
      dataType: 'uuid',
      nullable: 'NO',
    }
  })
  articleSourceId: string;
}

export interface ArticleSketchRelations {
}

export type ArticleSketchWithRelations = ArticleSketch & ArticleSketchRelations;
