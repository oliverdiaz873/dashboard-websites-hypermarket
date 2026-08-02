import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { StatsPageComponent } from './stats-page.component';

describe('StatsPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StatsPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('muestra el encabezado de estadísticas', () => {
    const fixture = TestBed.createComponent(StatsPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Estadísticas');
  });
});
