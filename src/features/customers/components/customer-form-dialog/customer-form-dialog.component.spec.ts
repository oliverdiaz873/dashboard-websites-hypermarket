import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { getStorageItem } from '@core/utils/storage.util';

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

  function setup(customer?: Customer) {
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

  beforeEach(() => window.localStorage.clear());

  it('crea un cliente con los datos del formulario', () => {
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

  it('edita prellenando los datos del cliente', () => {
    const fixture = setup(makeCustomer());

    expect(fixture.componentInstance.isEditing).toBe(true);
    expect(fixture.componentInstance.form.controls.name.value).toBe('Ana María Rodríguez');
    expect(fixture.componentInstance.form.controls.email.value).toBe(
      'anamaria.rodriguez@gmail.com',
    );
  });

  it('guarda el borrador al cancelar con cambios y lo restaura en el próximo alta', () => {
    const first = setup();
    first.componentInstance.form.controls.name.setValue('Borrador');
    first.destroy();

    const draft = getStorageItem<{ name: string }>(STORAGE_KEYS.customerForm);
    expect(draft).toEqual(expect.objectContaining({ name: 'Borrador' }));

    const second = setup();
    expect(second.componentInstance.form.controls.name.value).toBe('Borrador');
  });

  it('no guarda borrador al cancelar en modo edición', () => {
    const fixture = setup(makeCustomer());
    fixture.componentInstance.form.controls.name.setValue('Cambio');

    fixture.destroy();

    expect(getStorageItem(STORAGE_KEYS.customerForm)).toBeNull();
  });

  it('no guarda borrador tras un alta exitosa', () => {
    const fixture = setup();
    fixture.componentInstance.form.setValue(EXPECTED_RESULT);
    fixture.componentInstance.submit();

    fixture.destroy();

    expect(getStorageItem(STORAGE_KEYS.customerForm)).toBeNull();
  });
});
