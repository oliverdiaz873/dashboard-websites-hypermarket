import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  async function setup(url: string): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: BreadcrumbComponent },
          { path: '**', component: BreadcrumbComponent },
        ]),
      ],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra Inicio y Dashboard en la ruta raíz', async () => {
    const el = await setup('/dashboard');
    expect(el.textContent).toContain('Inicio');
    expect(el.textContent).toContain('Dashboard');
  });

  it('marca el último segmento como página actual', async () => {
    const el = await setup('/dashboard');
    const current = el.querySelector('[aria-current="page"]');
    expect(current?.textContent).toContain('Dashboard');
  });

  it('muestra segmentos desconocidos sin enlace', async () => {
    const el = await setup('/productos/nuevo');
    expect(el.textContent).toContain('productos');
    expect(el.textContent).toContain('nuevo');
  });

  it('solo el último segmento lleva aria-current', async () => {
    const el = await setup('/productos/nuevo');
    const active = el.querySelectorAll('[aria-current="page"]');
    expect(active.length).toBe(1);
    expect(active[0]?.textContent).toContain('nuevo');
    expect(el.querySelector('[aria-current="page"]')?.textContent).not.toContain('productos');
  });
});
