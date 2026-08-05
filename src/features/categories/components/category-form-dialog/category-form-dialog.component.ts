import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { slugify } from '@core/utils/string.util';
import type { Category, CategorySubcategory } from '../../models/category.model';

export interface CategoryFormDialogData {
  category?: Category;
}

export interface CategoryFormResult {
  name: string;
  subcategories: CategorySubcategory[];
}

@Component({
  selector: 'app-category-form-dialog',
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
  ],
})
export class CategoryFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CategoryFormDialogComponent>);
  protected readonly data = inject<CategoryFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditing = this.data.category !== undefined;

  protected readonly form = new FormGroup({
    name: new FormControl<string>(this.data.category?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    subcategories: new FormArray<FormControl<string>>([]),
  });

  constructor() {
    for (const sub of this.data.category?.subcategories ?? []) {
      this.form.controls.subcategories.push(
        new FormControl<string>(sub.name, { nonNullable: true }),
      );
    }
  }

  protected get subcategories(): FormArray<FormControl<string>> {
    return this.form.controls.subcategories;
  }

  protected addSubcategory(): void {
    this.subcategories.push(new FormControl<string>('', { nonNullable: true }));
  }

  protected removeSubcategory(index: number): void {
    this.subcategories.removeAt(index);
  }

  protected trackIndex(index: number): number {
    return index;
  }

  protected submit(): void {
    if (!this.form.controls.name.value.trim()) return;
    const subcategories: CategorySubcategory[] = this.subcategories.controls
      .map((control) => control.value.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({ name, slug: slugify(name) }));
    const result: CategoryFormResult = {
      name: this.form.controls.name.value.trim(),
      subcategories,
    };
    this.dialogRef.close(result);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
