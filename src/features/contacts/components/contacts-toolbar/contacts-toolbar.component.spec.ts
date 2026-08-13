import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ContactsToolbarComponent } from './contacts-toolbar.component';
import { ContactsStore } from '../../state/contacts.store';

describe('ContactsToolbarComponent', () => {
  let fixture: ComponentFixture<ContactsToolbarComponent>;
  let component: ContactsToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ContactsToolbarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ofrece las opciones de estado del backend', () => {
    expect(component['statusOptions'].map((o) => o.value)).toEqual(['pending', 'read', 'answered']);
  });

  it('onStatus delega en setStatusFilter del store', () => {
    const store = TestBed.inject(ContactsStore);
    const spy = jest.spyOn(store, 'setStatusFilter');

    component.onStatus('answered');

    expect(spy).toHaveBeenCalledWith('answered');
  });
});
