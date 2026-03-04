import { TestBed } from '@angular/core/testing';

import { Parqueadero } from './parqueadero';

describe('Parqueadero', () => {
  let service: Parqueadero;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parqueadero);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
