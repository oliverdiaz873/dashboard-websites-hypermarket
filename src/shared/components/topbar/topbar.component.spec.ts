import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';
import { ThemeStore } from '@core/state/theme/theme.store';

import { TopbarComponent } from './topbar.component';

describe('TopbarComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('cambia el tema al pulsar el botón de tema', () => {
    const themeStore = TestBed.inject(ThemeStore);
    themeStore.setMode('light');
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const themeBtn = Array.from(el.querySelectorAll('button')).find((btn) =>
      (btn.getAttribute('aria-label') ?? '').startsWith('Cambiar a tema'),
    );
    expect(themeBtn).toBeTruthy();
    themeBtn?.click();
    expect(themeStore.mode()).toBe('dark');
  });

  it('abre el menú móvil', () => {
    const sidebarStore = TestBed.inject(SidebarStore);
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    const openBtn = (fixture.nativeElement as HTMLElement).querySelector(
      'button[aria-label="Abrir menú"]',
    ) as HTMLButtonElement;
    openBtn.click();
    expect(sidebarStore.isMobileOpen()).toBe(true);
  });

  it('muestra el contador de notificaciones', () => {
    const notificationsStore = TestBed.inject(NotificationsStore);
    notificationsStore.add({ type: NOTIFICATION_TYPE.ERROR, message: 'Error de prueba' });
    const fixture = TestBed.createComponent(TopbarComponent);
    fixture.detectChanges();
    const badge = (fixture.nativeElement as HTMLElement).querySelector('.mat-badge-content');
    expect(badge?.textContent?.trim()).toBe('1');
  });
});
