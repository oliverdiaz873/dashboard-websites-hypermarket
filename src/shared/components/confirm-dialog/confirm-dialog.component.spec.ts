import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let close: jest.Mock;

  beforeEach(async () => {
    close = jest.fn();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { title: 'Eliminar', message: '¿Confirmas?', confirmLabel: 'Eliminar' },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
  });

  it('muestra el título y el mensaje', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Eliminar');
    expect(text).toContain('¿Confirmas?');
  });

  it('cierra con true al confirmar', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const confirmBtn = Array.from(buttons).find((b) => b.textContent?.trim() === 'Eliminar');
    confirmBtn?.dispatchEvent(new Event('click'));
    expect(close).toHaveBeenCalledWith(true);
  });

  it('cierra con false al cancelar', () => {
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find((b) => b.textContent?.trim() === 'Cancelar');
    cancelBtn?.dispatchEvent(new Event('click'));
    expect(close).toHaveBeenCalledWith(false);
  });
});
