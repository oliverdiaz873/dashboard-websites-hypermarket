import { TestBed } from '@angular/core/testing';

import { NOTIFICATION_TYPE } from '../../enums/notification-type';
import { NotificationsStore } from './notifications.store';

describe('NotificationsStore', () => {
  let store: InstanceType<typeof NotificationsStore>;

  beforeEach(() => {
    store = TestBed.inject(NotificationsStore);
    store.clear();
  });

  it('add genera id y timestamp', () => {
    store.add({ type: NOTIFICATION_TYPE.INFO, message: 'Hola' });
    expect(store.notifications()).toHaveLength(1);
    const notification = store.notifications()[0];
    expect(notification.id).toBeTruthy();
    expect(notification.createdAt).toBeGreaterThan(0);
  });

  it('remove elimina por id', () => {
    store.add({ type: NOTIFICATION_TYPE.ERROR, message: 'x' });
    const id = store.notifications()[0].id;
    store.remove(id);
    expect(store.notifications()).toHaveLength(0);
  });

  it('clear vacía la lista y resetea unreadCount', () => {
    store.add({ type: NOTIFICATION_TYPE.INFO, message: 'a' });
    store.add({ type: NOTIFICATION_TYPE.WARNING, message: 'b' });
    expect(store.unreadCount()).toBe(2);
    store.clear();
    expect(store.notifications()).toHaveLength(0);
    expect(store.unreadCount()).toBe(0);
  });
});
