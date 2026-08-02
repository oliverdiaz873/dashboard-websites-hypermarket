import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFoundPageComponent } from './not-found-page.component';

describe('NotFoundPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NotFoundPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('muestra el mensaje de página no encontrada', () => {
    const fixture = TestBed.createComponent(NotFoundPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Página no encontrada');
    expect(el.querySelector('a[routerLink="/dashboard"]')).toBeTruthy();
  });
});
