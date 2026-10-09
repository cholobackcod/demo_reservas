import { TestBed } from '@angular/core/testing';

import { Labs } from './labs';

describe('Labs', () => {
  let service: Labs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Labs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
