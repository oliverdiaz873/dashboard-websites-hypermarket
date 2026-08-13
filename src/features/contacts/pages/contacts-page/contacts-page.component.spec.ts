import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ContactsPageComponent } from './contacts-page.component';
import type { ContactMessage } from '../../models/contact-message.model';
import type { TableActionEvent } from '@shared/models/table.model';

const contact: ContactMessage = {
  id: 'cm1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  message: 'Consulta sobre un pedido',
  status: 'pending',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};

describe('ContactsPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ContactsPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra el encabezado de contactos y dispara la carga inicial', () => {
    const fixture = TestBed.createComponent(ContactsPageComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Contactos');
  });

  it('onAction con read delega en updateStatus', () => {
    const fixture = TestBed.createComponent(ContactsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'updateStatus');
    component.onAction({ actionId: 'read', row: contact } as TableActionEvent<ContactMessage>);

    expect(spy).toHaveBeenCalledWith('cm1', 'read');
  });

  it('onAction con answered delega en updateStatus', () => {
    const fixture = TestBed.createComponent(ContactsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'updateStatus');
    component.onAction({ actionId: 'answered', row: contact } as TableActionEvent<ContactMessage>);

    expect(spy).toHaveBeenCalledWith('cm1', 'answered');
  });

  it('onAction con delete abre el diálogo de confirmación', () => {
    const fixture = TestBed.createComponent(ContactsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const openSpy = jest.spyOn(component as never, 'confirmDelete');
    component.onAction({ actionId: 'delete', row: contact } as TableActionEvent<ContactMessage>);

    expect(openSpy).toHaveBeenCalledWith(contact);
  });
});
