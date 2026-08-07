import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import type { SortDirection } from '@core/enums/sort-direction';

import { CustomersStore } from '../../state/customers.store';
import { CustomersToolbarComponent } from './customers-toolbar.component';

describe('CustomersToolbarComponent', () => {
  let fixture: ComponentFixture<CustomersToolbarComponent>;
  let component: CustomersToolbarComponent;
  let store: {
    search(): string;
    status(): string;
    sortOrder(): SortDirection;
    sortBy(): string;
    setSearch: jest.Mock;
    setStatus: jest.Mock;
    setSort: jest.Mock;
    refresh: jest.Mock;
  };

  beforeEach(async () => {
    store = {
      search: () => '',
      status: () => '',
      sortOrder: () => 'asc',
      sortBy: () => 'createdAt',
      setSearch: jest.fn(),
      setStatus: jest.fn(),
      setSort: jest.fn(),
      refresh: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CustomersToolbarComponent],
      providers: [{ provide: CustomersStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('expone las opciones de estado y orden de las constantes', () => {
    expect(component['statusOptions'].map((o) => o.value)).toEqual([
      'active',
      'blocked',
      'pending',
    ]);
    expect(component['sortOptions'].map((o) => o.value)).toEqual(['name', 'email', 'createdAt']);
  });

  it('delega la búsqueda al store', () => {
    component.onSearch('ana');
    expect(store.setSearch).toHaveBeenCalledWith('ana');
  });

  it('delega el filtro de estado al store', () => {
    component.onStatus('blocked');
    expect(store.setStatus).toHaveBeenCalledWith('blocked');
  });

  it('aplica el orden manteniendo la dirección actual', () => {
    component.onSortBy('name');
    expect(store.setSort).toHaveBeenCalledWith('name', 'asc');
  });

  it('alterna la dirección del orden actual', () => {
    component.toggleDirection();
    expect(store.setSort).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('delega la actualización del listado al store', () => {
    component['store'].refresh();
    expect(store.refresh).toHaveBeenCalled();
  });
});
