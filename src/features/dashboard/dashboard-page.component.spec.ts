import { TestBed } from '@angular/core/testing';

import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({ imports: [DashboardPageComponent] }).compileComponents();
  });

  it('renderiza el placeholder del dashboard', () => {
    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Dashboard');
    expect(el.textContent).toContain('Bienvenido al panel');
  });
});
