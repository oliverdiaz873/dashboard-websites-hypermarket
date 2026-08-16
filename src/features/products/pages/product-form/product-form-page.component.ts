import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

import { ProductsStore } from '../../state/products.store';
import {
  ProductFormComponent,
  type ProductFormSubmit,
} from '../../components/product-form/product-form.component';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../../models/product.model';

@Component({
  selector: 'app-product-form-page',
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, ProductFormComponent],
})
export class ProductFormPageComponent {
  protected readonly store = inject(ProductsStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly productForm = viewChild(ProductFormComponent);
  protected readonly product = signal<Product | null>(null);
  protected readonly isCreate = signal(false);
  protected readonly isLoadingProduct = signal(false);

  constructor() {
    const mode = this.route.snapshot.data['mode'];
    this.isCreate.set(mode !== 'edit');

    void this.store.loadFormOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoadingProduct.set(true);
      void this.store.loadProduct(id).then((product) => {
        this.product.set(product);
        this.isLoadingProduct.set(false);
      });
    }
  }

  protected get submitting(): boolean {
    return this.store.isSubmitting();
  }

  protected async onSubmitted(submit: ProductFormSubmit): Promise<void> {
    const create = this.isCreate();
    const { payload, file, removeImage } = submit;
    try {
      if (create) {
        await this.store.createProduct(payload as CreateProductPayload, file);
        this.notificationsStore.add({
          type: NOTIFICATION_TYPE.SUCCESS,
          title: 'Producto creado',
          message: 'El producto se creó correctamente.',
        });
      } else {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) return;
        await this.store.updateProduct(id, payload as UpdateProductPayload, file, removeImage);
        this.notificationsStore.add({
          type: NOTIFICATION_TYPE.SUCCESS,
          title: 'Producto actualizado',
          message: 'Los cambios se guardaron correctamente.',
        });
      }
      await this.router.navigate(['/products']);
    } catch {
      // El error ya se notifica vía ErrorInterceptor + store.
    }
  }

  protected async onCancel(): Promise<void> {
    if (this.productForm()?.hasUnsavedChanges()) {
      const confirmed = await this.confirmDiscard();
      if (!confirmed) return;
    }
    await this.router.navigate(['/products']);
  }

  private async confirmDiscard(): Promise<boolean | undefined> {
    return firstValueFrom(
      this.dialog
        .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
          data: {
            title: 'Descartar cambios',
            message: 'Tienes cambios sin guardar. ¿Deseas salir sin guardar?',
            confirmLabel: 'Descartar',
            cancelLabel: 'Seguir editando',
          },
        })
        .afterClosed(),
    );
  }
}
