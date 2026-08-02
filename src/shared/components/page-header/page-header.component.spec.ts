import { TestBed } from '@angular/core/testing';

import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [PageHeaderComponent] }).compileComponents();
  });

  it('muestra title y subtitle', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Productos');
    fixture.componentRef.setInput('subtitle', 'Gestión de catálogo');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Productos');
    expect(el.textContent).toContain('Gestión de catálogo');
  });

  it('omite el subtitle cuando no se provee', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Solo título');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('subtitle');
  });
});
