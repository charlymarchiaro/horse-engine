import { Entity, model, property } from '@loopback/repository';

@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_scraping_stats_dyn' },
  },
})
export class ArticleScrapingStatsDyn extends Entity {
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
      columnName: 'published_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  published_count?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'scraped_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  scraped_count?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'pub_to_scrap_c1_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  pub_to_scrap_c1_count?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'pub_to_scrap_c2_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  pub_to_scrap_c2_count?: number;

  @property({
    type: 'number',
    postgresql: {
      columnName: 'pub_to_scrap_c3_count',
      dataType: 'INTEGER',
      nullable: 'YES',
    }
  })
  pub_to_scrap_c3_count?: number;


  constructor(data?: Partial<ArticleScrapingStatsDyn>) {
    super(data);
  }
}

export interface ArticleScrapingStatsDynRelations {
  // describe navigational properties here
}

export type ArticleScrapingStatsDynWithRelations = ArticleScrapingStatsDyn & ArticleScrapingStatsDynRelations;
