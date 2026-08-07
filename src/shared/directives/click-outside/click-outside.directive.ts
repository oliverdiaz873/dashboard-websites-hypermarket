import { Directive, ElementRef, EventEmitter, HostListener, Output, inject } from '@angular/core';

/**
 * Directiva reutilizable para detectar clics fuera del elemento host.
 *
 * Uso:
 * ```html
 * <div (appClickOutside)="onClickOutside()">…</div>
 * ```
 *
 * Emite cuando un `click` (o `pointerdown`) ocurre fuera del host. Pensada para
 * dropdowns, menús, palettes y overlays que deban cerrarse al hacer clic fuera.
 */
@Directive({
  selector: '[appClickOutside]',
})
export class ClickOutsideDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Output() readonly appClickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }
}
