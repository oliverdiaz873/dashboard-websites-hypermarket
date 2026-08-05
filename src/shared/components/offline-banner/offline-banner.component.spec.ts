import { TestBed } from '@angular/core/testing';

import { OfflineStore } from '@core/state/offline/offline.store';

import { OfflineBannerComponent } from './offline-banner.component';

describe('OfflineBannerComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [OfflineBannerComponent],
    }).compileComponents();
  });

  it('se oculta cuando hay conexión', () => {
    const store = TestBed.inject(OfflineStore);
    store.setOnline(true);
    const fixture = TestBed.createComponent(OfflineBannerComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('');
  });

  it('muestra el banner cuando se pierde la conexión', () => {
    const store = TestBed.inject(OfflineStore);
    store.setOnline(false);
    const fixture = TestBed.createComponent(OfflineBannerComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin conexión a internet');
  });
});
