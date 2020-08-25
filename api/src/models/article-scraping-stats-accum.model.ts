import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_scraping_stats_accum' },
  },
})
export class ArticleScrapingStatsAccum extends Entity {
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
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'date',
      dataType: 'DATE',
      nullable: 'NO',
    }
  })
  date: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'source_name',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  source_name: string;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'total_error_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  total_error_count?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'total_success_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  total_success_count?: number;


  constructor(data?: Partial<ArticleScrapingStatsAccum>) {
    super(data);
  }
}

export interface ArticleScrapingStatsAccumRelations {
  // describe navigational properties here
}

export type ArticleScrapingStatsAccumWithRelations = ArticleScrapingStatsAccum & ArticleScrapingStatsAccumRelations;
