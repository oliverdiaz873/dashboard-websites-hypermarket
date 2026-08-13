import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';

import type { Customer } from '../../models/customer.model';
import { CustomersStore } from '../../state/customers.store';
import { CustomerDetailPageComponent } from './customer-detail-page.component';

@Component({ template: '', standalone: true })
class CustomersRouteStubComponent {}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    phone: '(809) 555-0101',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function makeRoute(id: string | null): ActivatedRoute {
  return {
    snapshot: { paramMap: { get: () => id } },
  } as unknown as ActivatedRoute;
}

describe('CustomerDetailPageComponent', () => {
  let store: { findById: jest.Mock };

  beforeEach(() => {
    store = { findById: jest.fn() };
  });

  function setup(id: string, route?: ActivatedRoute) {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CustomerDetailPageComponent],
      providers: [
        provideRouter([{ path: 'customers', component: CustomersRouteStubComponent }]),
        { provide: CustomersStore, useValue: store },
        { provide: ActivatedRoute, useValue: route ?? makeRoute(id) },
      ],
    });
    const fixture = TestBed.createComponent(CustomerDetailPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el estado de carga mientras se resuelve el detalle', () => {
    store.findById.mockReturnValue(new Subject<Customer>());

    const fixture = setup('CUS-0001');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cargando cliente…');
  });

  it('muestra los datos del cliente obtenidos por findById', async () => {
    store.findById.mockReturnValue(of(makeCustomer()));

    const fixture = setup('CUS-0001');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(store.findById).toHaveBeenCalledWith('CUS-0001');
    expect(text).toContain('Ana María Rodríguez');
    expect(text).toContain('anamaria.rodriguez@gmail.com');
    expect(text).toContain('Activo');
    expect(text).toContain('(809) 555-0101');
  });

  it('muestra el estado de error con opción de volver', async () => {
    store.findById.mockReturnValue(throwError(() => new Error('boom')));

    const fixture = setup('CUS-0001');
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No se pudo cargar el cliente');
    expect(text).toContain('Volver a clientes');
  });

  it('muestra error si la ruta no trae id', () => {
    store.findById.mockReturnValue(of(makeCustomer()));

    const fixture = setup('', makeRoute(null));
    fixture.detectChanges();

    expect(store.findById).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No se pudo cargar el cliente',
    );
  });

  it('navega de vuelta a la lista', () => {
    store.findById.mockReturnValue(of(makeCustomer()));

    const fixture = setup('CUS-0001');
    const component = fixture.componentInstance;
    const navigate = jest.spyOn(component['router'], 'navigate');

    component.goBack();

    expect(navigate).toHaveBeenCalledWith(['/customers']);
  });
});
