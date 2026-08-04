import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrdersToolbarComponent } from './orders-toolbar.component';
import { OrdersStore } from '../../state/orders.store';
import type { SortDirection } from '@core/enums/sort-direction';

describe('OrdersToolbarComponent', () => {
  let fixture: ComponentFixture<OrdersToolbarComponent>;
  let component: OrdersToolbarComponent;
  let store: {
    search(): string;
    status(): string;
    sortOrder(): SortDirection;
    sortBy(): string;
    total(): number;
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
      total: () => 0,
      setSearch: jest.fn(),
      setStatus: jest.fn(),
      setSort: jest.fn(),
      refresh: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OrdersToolbarComponent],
      providers: [{ provide: OrdersStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('expone las opciones de status y orden derivadas de los enums', () => {
    expect(component['statusOptions'].map((o) => o.value)).toEqual([
      'pending',
      'processing',
      'completed',
      'cancelled',
    ]);
    expect(component['sortOptions'].map((o) => o.value)).toEqual([
      'createdAt',
      'updatedAt',
      'subtotal',
      'status',
    ]);
  });

  it('delega la búsqueda al store', () => {
    component.onSearch('oliver');
    expect(store.setSearch).toHaveBeenCalledWith('oliver');
  });

  it('delega el status al store', () => {
    component.onStatus('processing');
    expect(store.setStatus).toHaveBeenCalledWith('processing');
  });

  it('aplica el orden manteniendo la dirección actual', () => {
    component.onSortBy('subtotal');
    expect(store.setSort).toHaveBeenCalledWith('subtotal', 'asc');
  });

  it('alterna la dirección del orden actual', () => {
    component.toggleDirection();
    expect(store.setSort).toHaveBeenCalledWith('createdAt', 'desc');
  });
});
