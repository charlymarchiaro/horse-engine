import { Entity, model, property } from '@loopback/repository';


@model({
  settings: {
    postgresql: { schema: 'scraper', table: 'article_summary' },
  },
})
export class ArticleSummary extends Entity {
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
    index: true,
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
    type: 'string',
    postgresql: {
      columnName: 'source_name',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  sourceName: string;

  @property({
    type: 'date',
    postgresql: {
      columnName: 'scraped_at',
      dataType: 'TIMESTAMP WITH TIME ZONE',
      nullable: 'YES',
    }
  })
  scrapedAt: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'parse_function',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  parseFunction?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'result',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  result?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'spider_name',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'NO',
    }
  })
  spiderName: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'scrapyd_node_id',
      dataType: 'VARCHAR',
      dataLength: 64,
      nullable: 'YES',
    }
  })
  scrapydNodeId?: string;

  constructor(data?: Partial<ArticleSummary>) {
    super(data);
  }
}

export interface ArticleSummaryRelations {
}

export type ArticleSummaryWithRelations = ArticleSummary & ArticleSummaryRelations;
