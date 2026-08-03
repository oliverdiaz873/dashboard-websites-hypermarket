import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(PaginationComponent);
    const comp = fixture.componentInstance;
    fixture.componentRef.setInput('page', 2);
    fixture.componentRef.setInput('pageSize', 20);
    fixture.componentRef.setInput('total', 45);
    fixture.detectChanges();
    return { fixture, comp };
  }

  it('calcula rango y total de páginas', async () => {
    const { comp } = await setup();

    expect(comp['totalPages']()).toBe(3);
    expect(comp['from']()).toBe(21);
    expect(comp['to']()).toBe(40);
    expect(comp['hasPrev']()).toBe(true);
    expect(comp['hasNext']()).toBe(true);
  });

  it('emite pageChange al avanzar', async () => {
    const { comp } = await setup();
    let page: number | undefined;
    comp.pageChange.subscribe((p) => (page = p));

    comp.shift(1);
    expect(page).toBe(3);
  });

  it('emite pageSizeChange desde el select', async () => {
    const { fixture, comp } = await setup();
    let size: number | undefined;
    comp.pageSizeChange.subscribe((s) => (size = s));

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '50';
    select.dispatchEvent(new Event('change'));

    expect(size).toBe(50);
  });
});
