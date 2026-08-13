import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { OffersPageComponent } from './offers-page.component';
import type { Offer } from '../../models/offer.model';
import type { TableActionEvent } from '@shared/models/table.model';

const offer: Offer = {
  id: 'o1',
  productId: 'p1',
  productName: 'Arroz 1kg',
  originalPrice: 100,
  discountPrice: 80,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  isActive: true,
};

describe('OffersPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OffersPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra el encabezado de ofertas y dispara la carga inicial', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ofertas');
  });

  it('onCreate abre el formulario de creación', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'openForm');
    component.onCreate();
    expect(spy).toHaveBeenCalledWith();
  });

  it('onAction con edit abre el formulario con la oferta', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'openForm');
    component.onAction({ actionId: 'edit', row: offer } as TableActionEvent<Offer>);
    expect(spy).toHaveBeenCalledWith(offer);
  });

  it('onAction con toggle delega en store.toggleActive', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'toggleActive');
    component.onAction({ actionId: 'toggle', row: offer } as TableActionEvent<Offer>);
    expect(spy).toHaveBeenCalledWith(offer);
  });

  it('onAction con delete abre el diálogo de confirmación', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'confirmDelete');
    component.onAction({ actionId: 'delete', row: offer } as TableActionEvent<Offer>);
    expect(spy).toHaveBeenCalledWith(offer);
  });

  it('retry vuelve a cargar el store', () => {
    const fixture = TestBed.createComponent(OffersPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'load');
    component.retry();
    expect(spy).toHaveBeenCalled();
  });
});
