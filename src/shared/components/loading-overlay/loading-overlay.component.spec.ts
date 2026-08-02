import { TestBed } from '@angular/core/testing';

import { LoadingStore } from '@core/state/loading/loading.store';

import { LoadingOverlayComponent } from './loading-overlay.component';

describe('LoadingOverlayComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayComponent],
    }).compileComponents();
  });

  function overlayEl(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
    return fixture.nativeElement.querySelector('.hs-loading-overlay');
  }

  it('oculta la barra cuando no hay cargas activas', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.detectChanges();
    const el = overlayEl(fixture);
    expect(el?.querySelector('.hs-loading-bar')).toBeTruthy();
    expect(el?.classList.contains('opacity-0')).toBe(true);
  });

  it('muestra la barra cuando hay peticiones activas', () => {
    const loadingStore = TestBed.inject(LoadingStore);
    loadingStore.begin();
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.detectChanges();
    expect(overlayEl(fixture)?.classList.contains('opacity-0')).toBe(false);
    loadingStore.end();
  });

  it('acepta un override local de visibilidad', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    expect(overlayEl(fixture)?.classList.contains('opacity-0')).toBe(false);
  });
});
