import { TestBed } from '@angular/core/testing';

import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [StatCardComponent] }).compileComponents();
  });

  it('muestra el título y el valor formateado con moneda', () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('title', 'Ingresos');
    fixture.componentRef.setInput('value', 1234.5);
    fixture.componentRef.setInput('unit', 'RD$');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ingresos');
    expect(el.textContent).toContain('1,234.50');
  });

  it('formatea valores sin unidad como enteros', () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('value', 4500);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('4,500');
  });

  it('muestra la tendencia con porcentaje signado cuando no hay label', () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('trend', -5.5);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('-5.5%');
  });

  it('muestra el label de tendencia cuando se provee (p.ej. vs mes anterior)', () => {
    const fixture = TestBed.createComponent(StatCardComponent);
    fixture.componentRef.setInput('trend', 12.5);
    fixture.componentRef.setInput('trendLabel', 'vs mes anterior');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('vs mes anterior');
  });
});
