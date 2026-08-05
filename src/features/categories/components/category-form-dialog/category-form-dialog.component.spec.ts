import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

import {
  CategoryFormDialogComponent,
  type CategoryFormResult,
} from './category-form-dialog.component';
import type { Category } from '../../models/category.model';

const category: Category = {
  id: 'c1',
  name: 'Alimentos',
  slug: 'alimentos',
  subcategories: [{ name: 'Despensa', slug: 'despensa' }],
};

interface Exposed {
  form: FormGroup<{
    name: FormControl<string>;
    subcategories: FormArray<FormControl<string>>;
  }>;
  submit(): void;
  cancel(): void;
  addSubcategory(): void;
}

function exposed(component: CategoryFormDialogComponent): Exposed {
  return component as unknown as Exposed;
}

describe('CategoryFormDialogComponent', () => {
  let fixture: ComponentFixture<CategoryFormDialogComponent>;
  let component: CategoryFormDialogComponent;
  let closeSpy: jest.Mock;

  beforeEach(async () => {
    closeSpy = jest.fn();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CategoryFormDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { category } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('precarga name y subcategorías al editar', () => {
    expect(exposed(component).form.controls.name.value).toBe('Alimentos');
    expect(exposed(component).form.controls.subcategories.length).toBe(1);
  });

  it('somete el payload con slugs generados desde los nombres', () => {
    const exp = exposed(component);
    exp.form.controls.name.setValue('Ropa y Calzado');
    exp.addSubcategory();
    exp.form.controls.subcategories.at(1)?.setValue('Zapatos');

    exp.submit();

    expect(closeSpy).toHaveBeenCalledWith({
      name: 'Ropa y Calzado',
      subcategories: [
        { name: 'Despensa', slug: 'despensa' },
        { name: 'Zapatos', slug: 'zapatos' },
      ],
    } satisfies CategoryFormResult);
  });

  it('no somete con nombre vacío', () => {
    exposed(component).form.controls.name.setValue('   ');
    exposed(component).submit();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('filtra subcategorías con nombre vacío', () => {
    const exp = exposed(component);
    exp.form.controls.name.setValue('Ferretería');
    exp.addSubcategory();
    exp.form.controls.subcategories.at(1)?.setValue('   ');

    exp.submit();

    expect(closeSpy).toHaveBeenCalledWith({
      name: 'Ferretería',
      subcategories: [{ name: 'Despensa', slug: 'despensa' }],
    });
  });

  it('cancelar cierra sin resultado', () => {
    exposed(component).cancel();
    expect(closeSpy).toHaveBeenCalledWith(undefined);
  });
});
