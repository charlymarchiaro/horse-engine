import { TestBed } from '@angular/core/testing';

import { ResultsDownloaderService } from './results-downloader.service';

describe('ResultsDownloaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ResultsDownloaderService = TestBed.get(ResultsDownloaderService);
    expect(service).toBeTruthy();
  });
});
