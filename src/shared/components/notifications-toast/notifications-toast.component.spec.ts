import { of } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';

import { NotificationsToastComponent } from './notifications-toast.component';

describe('NotificationsToastComponent', () => {
  let fixture: ComponentFixture<NotificationsToastComponent>;
  let store: InstanceType<typeof NotificationsStore>;
  let open: jest.Mock;

  const createSnackBarRef = (): Partial<MatSnackBarRef<unknown>> => ({
    afterDismissed: jest.fn(() => of({ dismissedByAction: false })),
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();
    open = jest.fn().mockReturnValue(createSnackBarRef());
    await TestBed.configureTestingModule({
      imports: [NotificationsToastComponent],
      providers: [{ provide: MatSnackBar, useValue: { open } }],
    }).compileComponents();
    store = TestBed.inject(NotificationsStore);
    store.clear();
    fixture = TestBed.createComponent(NotificationsToastComponent);
    fixture.detectChanges();
  });

  it('abre un snackbar al llegar una notificación', async () => {
    store.add({ type: NOTIFICATION_TYPE.ERROR, message: 'Fallo al guardar' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0][0]).toBe('Fallo al guardar');
  });

  it('prefija el título a existe cuando lo hay', async () => {
    store.add({ type: NOTIFICATION_TYPE.INFO, title: 'Tiempo agotado', message: 'Reintenta' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(open.mock.calls[0][0]).toBe('Tiempo agotado: Reintenta');
  });

  it('elimina la notificación del store al descartarse el snackbar', async () => {
    store.add({ type: NOTIFICATION_TYPE.SUCCESS, message: 'Guardado' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.unreadCount()).toBe(0);
  });
});
