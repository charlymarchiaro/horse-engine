import {Model, model, property} from '@loopback/repository';

@model()
export class SearchDateSpan extends Model {
  @property({
    type: 'date',
    required: true,
  })
  fromDateIncl: string;

  @property({
    type: 'date',
    required: true,
  })
  toDateIncl: string;


  constructor(data?: Partial<SearchDateSpan>) {
    super(data);
  }
}

export interface SearchDateSpanRelations {
  // describe navigational properties here
}

export type SearchDateSpanWithRelations = SearchDateSpan & SearchDateSpanRelations;
