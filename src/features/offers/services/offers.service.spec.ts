import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OffersService } from './offers.service';
import type { Offer } from '../models/offer.model';

const LIST_URL = 'http://localhost:3000/api/admin/offers';
const OFFERS_URL = 'http://localhost:3000/api/offers';

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: 'o1',
    productId: 'p1',
    productName: 'Arroz 1kg',
    originalPrice: 100,
    discountPrice: 80,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-12-31T00:00:00.000Z',
    isActive: true,
    ...overrides,
  };
}

describe('OffersService', () => {
  let service: OffersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OffersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list consume GET /api/admin/offers (array, sin paginación)', () => {
    let result: Offer[] | undefined;
    service.list().subscribe((res) => (result = res));

    const req = httpMock.expectOne(LIST_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [makeOffer()] });

    expect(result).toEqual([makeOffer()]);
  });

  it('create hace POST /api/offers con el payload', () => {
    let result: Offer | undefined;
    service
      .create({ productId: 'p1', originalPrice: 100, discountPrice: 80, startDate: '2026-01-01' })
      .subscribe((res) => (result = res));

    const req = httpMock.expectOne(OFFERS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      productId: 'p1',
      originalPrice: 100,
      discountPrice: 80,
      startDate: '2026-01-01',
    });
    req.flush({ success: true, data: makeOffer() });

    expect(result?.id).toBe('o1');
  });

  it('update hace PATCH /api/offers/:id y devuelve la oferta actualizada', () => {
    let result: Offer | undefined;
    service.update('o1', { isActive: false }).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${OFFERS_URL}/o1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ success: true, data: makeOffer({ isActive: false }) });

    expect(result?.isActive).toBe(false);
  });

  it('remove emite DELETE /api/offers/:id y completa sin cuerpo (204)', () => {
    let completed = false;
    service.remove('o1').subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${OFFERS_URL}/o1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});
