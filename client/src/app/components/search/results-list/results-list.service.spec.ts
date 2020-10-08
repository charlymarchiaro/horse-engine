import { TestBed } from '@angular/core/testing';

import { ResultsListService } from './results-list.service';

describe('ResultsListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResultsListService = TestBed.get(ResultsListService);
    expect(service).toBeTruthy();
  });
});
