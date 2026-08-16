import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  resolveDashboardImageUrl,
} from '../../utils/product-image.util';

/**
 * Selector/uploader de imagen de producto con drag & drop, preview y
 * validación cliente de tipo (allowlist) y tamaño (<= 5 MB).
 *
 * No sube nada: emite el `File` seleccionado (vía `fileChange`) y la intención
 * de quitar la imagen existente (vía `removeChange`). El flujo presigned ->
 * PUT -> PATCH `imageKey` lo orquesta el store/página.
 */
@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent implements OnDestroy {
  /** Imagen actual del producto (cruda, tal y como la devuelve el backend). */
  readonly initialImage = input<string | null>(null);

  readonly fileChange = output<File | null>();
  readonly removeChange = output<boolean>();

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly objectUrl = signal<string | null>(null);
  protected readonly removeImage = signal(false);
  protected readonly dragOver = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly previewUrl = computed(() => {
    if (this.removeImage()) return null;
    const objectUrl = this.objectUrl();
    if (objectUrl) return objectUrl;
    if (this.selectedFile()) return null;
    return resolveDashboardImageUrl(this.initialImage());
  });

  protected readonly hasImage = computed(() => this.previewUrl() !== null);

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  protected openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onFilePicked(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.onFilePicked(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onRemove(): void {
    this.revokeObjectUrl();
    this.selectedFile.set(null);
    this.error.set(null);
    this.removeImage.set(true);
    this.fileChange.emit(null);
    this.removeChange.emit(true);
  }

  private onFilePicked(file: File | null): void {
    this.revokeObjectUrl();
    if (!file) {
      this.selectedFile.set(null);
      this.error.set(null);
      this.fileChange.emit(null);
      return;
    }
    const invalid = this.validate(file);
    if (invalid) {
      this.selectedFile.set(null);
      this.error.set(invalid);
      this.fileChange.emit(null);
      return;
    }
    this.removeImage.set(false);
    this.selectedFile.set(file);
    this.objectUrl.set(URL.createObjectURL(file));
    this.error.set(null);
    this.fileChange.emit(file);
    this.removeChange.emit(false);
  }

  private validate(file: File): string | null {
    if (
      !ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])
    ) {
      return 'Formato no permitido. Usa JPEG, PNG, WebP, AVIF o GIF.';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return 'La imagen supera el tamaño máximo de 5 MB.';
    }
    return null;
  }

  private revokeObjectUrl(): void {
    const url = this.objectUrl();
    if (url) URL.revokeObjectURL(url);
    this.objectUrl.set(null);
  }
}
