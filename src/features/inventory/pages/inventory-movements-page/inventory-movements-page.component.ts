import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { firstValueFrom } from 'rxjs';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

import { InventoryService } from '../../services/inventory.service';
import { InventoryMovementsTableComponent } from '../../components/inventory-movements-table/inventory-movements-table.component';
import type { Inventory, InventoryMovement } from '../../models/inventory.model';

const DEFAULT_LIMIT = 20;

@Component({
  selector: 'app-inventory-movements-page',
  templateUrl: './inventory-movements-page.component.html',
  styleUrl: './inventory-movements-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    InventoryMovementsTableComponent,
    MatIcon,
    MatIconButton,
    MatTooltip,
  ],
})
export class InventoryMovementsPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryService = inject(InventoryService);

  protected readonly movements = signal<InventoryMovement[]>([]);
  protected readonly inventory = signal<Inventory | null>(null);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly isLoading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly inventoryId: string = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    if (!this.inventoryId) {
      this.error.set('Inventario no encontrado.');
      this.isLoading.set(false);
      return;
    }
    void this.loadAll();
  }

  protected async loadAll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const [inventory, movements] = await Promise.all([
        firstValueFrom(this.inventoryService.getById(this.inventoryId)),
        firstValueFrom(
          this.inventoryService.getMovements(this.inventoryId, this.page(), DEFAULT_LIMIT),
        ),
      ]);
      this.inventory.set(inventory);
      this.movements.set(movements.data);
      this.total.set(movements.pagination.total);
    } catch {
      this.error.set('No se pudieron cargar los movimientos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected async setPage(page: number): Promise<void> {
    this.page.set(page);
    await this.loadMovements();
  }

  protected async loadMovements(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const movements = await firstValueFrom(
        this.inventoryService.getMovements(this.inventoryId, this.page(), DEFAULT_LIMIT),
      );
      this.movements.set(movements.data);
      this.total.set(movements.pagination.total);
    } catch {
      this.error.set('No se pudieron cargar los movimientos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  protected goBack(): void {
    void this.router.navigate(['/inventory']);
  }
}
