import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  const flushPending = (): void => {
    httpMock
      .match((req) => req.url.includes('/api/admin/stats'))
      .forEach((req) => req.flush({ success: true, data: null }));
  };

  it('renderiza el header y el selector de rango (smoke sin gráficos)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('7d');
    expect(el.textContent).toContain('30d');
    expect(el.textContent).toContain('90d');
    flushPending();
  });

  it('muestra el indicador de carga antes de resolver las peticiones', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Cargando métricas');
    flushPending();
  });
});
