import {Entity, model, property} from '@loopback/repository';

@model()
export class ArticleScrapingStats extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  element: string;

  @property({
    type: 'number',
  })
  psr_h?: number;

  @property({
    type: 'number',
  })
  psr_1w?: number;

  @property({
    type: 'number',
  })
  sscd_h?: number;

  @property({
    type: 'number',
  })
  sscd_1w?: number;

  @property({
    type: 'number',
  })
  psddc1_h?: number;

  @property({
    type: 'number',
  })
  psddc2_h?: number;

  @property({
    type: 'number',
  })
  psddc3_h?: number;

  @property({
    type: 'number',
  })
  psddc1_1w?: number;

  @property({
    type: 'number',
  })
  psddc2_1w?: number;

  @property({
    type: 'number',
  })
  psddc3_1w?: number;


  constructor(data?: Partial<ArticleScrapingStats>) {
    super(data);
  }
}

export interface ArticleScrapingStatsRelations {
  // describe navigational properties here
}

export type ArticleScrapingStatsWithRelations = ArticleScrapingStats & ArticleScrapingStatsRelations;
