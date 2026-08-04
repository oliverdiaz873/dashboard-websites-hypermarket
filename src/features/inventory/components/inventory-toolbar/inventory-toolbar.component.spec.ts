import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InventoryToolbarComponent } from './inventory-toolbar.component';
import { InventoryStore } from '../../state/inventory.store';
import type { SortDirection } from '@core/enums/sort-direction';

describe('InventoryToolbarComponent', () => {
  let fixture: ComponentFixture<InventoryToolbarComponent>;
  let component: InventoryToolbarComponent;
  let store: {
    search(): string;
    status(): string;
    sortOrder(): SortDirection;
    sortBy(): string;
    total(): number;
    lowStockCount(): number;
    outOfStockCount(): number;
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
      sortBy: () => 'updatedAt',
      total: () => 0,
      lowStockCount: () => 0,
      outOfStockCount: () => 0,
      setSearch: jest.fn(),
      setStatus: jest.fn(),
      setSort: jest.fn(),
      refresh: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, InventoryToolbarComponent],
      providers: [{ provide: InventoryStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('expone las opciones de status y orden derivadas de los enums', () => {
    expect(component['statusOptions'].map((o) => o.value)).toEqual([
      'out-of-stock',
      'low-stock',
      'ok',
    ]);
    expect(component['sortOptions'].map((o) => o.value)).toEqual([
      'stock',
      'minStock',
      'updatedAt',
      'createdAt',
    ]);
  });

  it('delega la búsqueda al store', () => {
    component.onSearch('arroz');
    expect(store.setSearch).toHaveBeenCalledWith('arroz');
  });

  it('delega el status al store', () => {
    component.onStatus('low-stock');
    expect(store.setStatus).toHaveBeenCalledWith('low-stock');
  });

  it('aplica el orden manteniendo la dirección actual', () => {
    component.onSortBy('stock');
    expect(store.setSort).toHaveBeenCalledWith('stock', 'asc');
  });

  it('alterna la dirección del orden actual', () => {
    component.toggleDirection();
    expect(store.setSort).toHaveBeenCalledWith('updatedAt', 'desc');
  });
});
