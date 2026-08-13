import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ContactDetailDialogComponent } from './contact-detail-dialog.component';
import type { ContactMessage } from '../../models/contact-message.model';

const message: ContactMessage = {
  id: 'cm1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '(809) 555-5555',
  message: 'Consulta sobre un pedido',
  status: 'read',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-16T00:00:00.000Z',
};

describe('ContactDetailDialogComponent', () => {
  let fixture: ComponentFixture<ContactDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ContactDetailDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { message } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactDetailDialogComponent);
    fixture.detectChanges();
  });

  it('muestra los datos del mensaje y su estado traducido', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Juan Pérez');
    expect(text).toContain('juan@example.com');
    expect(text).toContain('(809) 555-5555');
    expect(text).toContain('Consulta sobre un pedido');
    expect(text).toContain('Leído');
  });
});
