import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { BrandFormDialogComponent, type BrandFormDialogData } from './brand-form-dialog.component';
import { BrandsStore } from '../../state/brands.store';
import type { Brand } from '../../models/brand.model';

const brand: Brand = {
  id: 'b1',
  name: 'Coca-Cola',
  slug: 'coca-cola',
  description: 'Bebidas gaseosas',
  status: 'active',
};

describe('BrandFormDialogComponent (crear)', () => {
  let fixture: ComponentFixture<BrandFormDialogComponent>;
  let component: BrandFormDialogComponent;
  let store: InstanceType<typeof BrandsStore>;
  const dialogRef = { close: jest.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, BrandFormDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} as BrandFormDialogData },
      ],
    }).compileComponents();
    store = TestBed.inject(BrandsStore);
    fixture = TestBed.createComponent(BrandFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra el título "Nueva marca"', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nueva marca');
  });

  it('no rellena el formulario en modo creación y arranca activa', () => {
    expect(component.form.getRawValue().name).toBe('');
    expect(component.form.getRawValue().isActive).toBe(true);
  });

  it('no envía ni cierra cuando el nombre está vacío', async () => {
    const spy = jest.spyOn(store, 'create');
    component.form.setValue({
      name: '   ',
      slug: '',
      description: '',
      logo: '',
      isActive: true,
    });

    await component['onSubmit']();

    expect(spy).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('envía el payload de creación y cierra con el resultado', async () => {
    const spy = jest.spyOn(store, 'create').mockResolvedValue(brand);
    component.form.setValue({
      name: '  Coca-Cola  ',
      slug: '',
      description: '  Bebidas  ',
      logo: '',
      isActive: true,
    });

    await component['onSubmit']();

    expect(spy).toHaveBeenCalledWith({
      name: 'Coca-Cola',
      slug: undefined,
      description: 'Bebidas',
      logo: undefined,
      status: 'active',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(brand);
  });
});

describe('BrandFormDialogComponent (editar)', () => {
  let fixture: ComponentFixture<BrandFormDialogComponent>;
  let component: BrandFormDialogComponent;
  let store: InstanceType<typeof BrandsStore>;
  const dialogRef = { close: jest.fn() };

  beforeEach(async () => {
    dialogRef.close.mockClear();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, BrandFormDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { brand } as BrandFormDialogData },
      ],
    }).compileComponents();
    store = TestBed.inject(BrandsStore);
    fixture = TestBed.createComponent(BrandFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra el título "Editar marca"', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Editar marca');
  });

  it('prellena el formulario con la marca existente', () => {
    const value = component.form.getRawValue();
    expect(value.name).toBe('Coca-Cola');
    expect(value.slug).toBe('coca-cola');
    expect(value.description).toBe('Bebidas gaseosas');
    expect(value.isActive).toBe(true);
  });

  it('envía el payload de actualización con el id de la marca', async () => {
    const spy = jest.spyOn(store, 'update').mockResolvedValue(brand);
    component.form.patchValue({ name: 'Coca-Cola Company', isActive: false });

    await component['onSubmit']();

    expect(spy).toHaveBeenCalledWith('b1', {
      name: 'Coca-Cola Company',
      slug: 'coca-cola',
      description: 'Bebidas gaseosas',
      logo: undefined,
      status: 'inactive',
    });
    expect(dialogRef.close).toHaveBeenCalledWith(brand);
  });
});
