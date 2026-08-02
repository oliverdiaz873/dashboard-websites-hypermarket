import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [EmptyStateComponent] }).compileComponents();
  });

  it('muestra icon, title y message', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('icon', 'inbox');
    fixture.componentRef.setInput('title', 'Sin datos');
    fixture.componentRef.setInput('message', 'No hay registros aún');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin datos');
    expect(el.textContent).toContain('No hay registros aún');
    expect(el.querySelector('mat-icon')?.textContent).toContain('inbox');
  });

  it('proyecta contenido en el slot de acciones', () => {
    @Component({
      selector: 'app-host',
      template: `<app-empty-state title="Vacío"
        ><button id="action">Crear</button></app-empty-state
      >`,
      imports: [EmptyStateComponent],
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('#action')).toBeTruthy();
  });
});
