import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Article, ArticleWithRelations } from './article.model';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_sketch' },
    foreignKeys: {
      fk__article_sketch__article: {
        name: 'fk__article_sketch__article',
        entity: 'Article',
        entityKey: 'id',
        foreignKey: 'article_id',
      },
    },
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

  @belongsTo(() => Article, {}, {
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
}

export interface ArticleSketchRelations {
  article?: ArticleWithRelations;
}

export type ArticleSketchWithRelations = ArticleSketch & ArticleSketchRelations;
