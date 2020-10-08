import { TestBed } from '@angular/core/testing';

import { SearchSchemeService } from './search-scheme.service';

describe('SearchSchemeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchSchemeService = TestBed.get(SearchSchemeService);
    expect(service).toBeTruthy();
  });
});
