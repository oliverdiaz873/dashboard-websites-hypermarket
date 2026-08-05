import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ChartContainerComponent } from './chart-container.component';

describe('ChartContainerComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ChartContainerComponent],
    }).compileComponents();
  });

  it('muestra el título y el subtítulo', () => {
    const fixture = TestBed.createComponent(ChartContainerComponent);
    fixture.componentRef.setInput('title', 'Ingresos');
    fixture.componentRef.setInput('subtitle', 'últimos 30 días');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ingresos');
    expect(el.textContent).toContain('últimos 30 días');
  });

  it('muestra el estado de carga en lugar del contenido', () => {
    const fixture = TestBed.createComponent(ChartContainerComponent);
    fixture.componentRef.setInput('title', 'Ingresos');
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cargando');
  });

  it('muestra el estado vacío con el mensaje configurado', () => {
    const fixture = TestBed.createComponent(ChartContainerComponent);
    fixture.componentRef.setInput('title', 'Ingresos');
    fixture.componentRef.setInput('isEmpty', true);
    fixture.componentRef.setInput('emptyMessage', 'Sin datos para este período.');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin datos');
    expect(el.textContent).toContain('Sin datos para este período.');
  });

  it('proyecta contenido cuando no está cargando ni vacío', () => {
    @Component({
      selector: 'app-host',
      template: `<app-chart-container title="X"
        ><div id="injected">Contenido</div></app-chart-container
      >`,
      imports: [ChartContainerComponent],
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('#injected')).toBeTruthy();
  });
});
