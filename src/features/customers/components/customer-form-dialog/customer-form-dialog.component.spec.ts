import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import type { Customer } from '../../models/customer.model';
import { CustomerFormDialogComponent } from './customer-form-dialog.component';

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    phone: '(809) 555-0101',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

const EXPECTED_RESULT = {
  name: 'Juan Pérez',
  email: 'juan.perez@correo.com',
  phone: '(809) 555-0101',
  address: {
    street: 'Calle 1',
    city: 'Santo Domingo',
    zipCode: '10101',
    country: 'República Dominicana',
  },
};

describe('CustomerFormDialogComponent', () => {
  let dialogRef: { close: jest.Mock };

  function setup(customer: Customer = makeCustomer()) {
    dialogRef = { close: jest.fn() };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CustomerFormDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { customer } },
      ],
    });
    const fixture = TestBed.createComponent(CustomerFormDialogComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('edita prellenando los datos del cliente', () => {
    const fixture = setup();
    const component = fixture.componentInstance;

    expect(component.form.controls.name.value).toBe('Ana María Rodríguez');
    expect(component.form.controls.email.value).toBe('anamaria.rodriguez@gmail.com');
    expect(component.form.controls.address.controls.city.value).toBe('');
  });

  it('guarda los cambios con los datos del formulario', () => {
    const fixture = setup();
    fixture.componentInstance.form.setValue(EXPECTED_RESULT);

    fixture.componentInstance.submit();

    expect(dialogRef.close).toHaveBeenCalledWith(EXPECTED_RESULT);
  });

  it('no cierra si el formulario es inválido', () => {
    const fixture = setup();
    fixture.componentInstance.form.patchValue({ name: 'Juan', email: 'no-es-correo' });

    fixture.componentInstance.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancela sin devolver datos', () => {
    const fixture = setup();

    fixture.componentInstance.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
