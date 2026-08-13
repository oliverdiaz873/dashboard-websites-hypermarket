import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import type {
  TableAction,
  TableActionEvent,
  TableBadgeTone,
  TableColumn,
} from '@shared/models/table.model';

import type { Brand } from '../../models/brand.model';

const ACTIVE_TONE: Record<'active' | 'inactive', TableBadgeTone> = {
  active: 'ok',
  inactive: 'low',
};

@Component({
  selector: 'app-brands-table',
  templateUrl: './brands-table.component.html',
  styleUrl: './brands-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class BrandsTableComponent {
  readonly items = input<Brand[]>([]);
  readonly loading = input<boolean>(false);

  readonly actionClicked = output<TableActionEvent<Brand>>();

  protected readonly columns: TableColumn<Brand>[] = [
    {
      key: 'name',
      header: 'Nombre',
      cell: (row) => row.name,
    },
    {
      key: 'slug',
      header: 'Slug',
      cell: (row) => row.slug,
      hideOnMobile: true,
    },
    {
      key: 'description',
      header: 'Descripción',
      cell: (row) => row.description || '—',
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Estado',
      badge: (row) => ({
        label: row.status === 'active' ? 'Activa' : 'Inactiva',
        tone: ACTIVE_TONE[row.status],
      }),
    },
  ];

  protected readonly actions: TableAction<Brand>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    {
      id: 'toggle',
      label: 'Desactivar',
      icon: 'toggle_off',
      visible: (row) => row.status === 'active',
    },
    {
      id: 'toggle',
      label: 'Activar',
      icon: 'toggle_on',
      visible: (row) => row.status !== 'active',
    },
    { id: 'delete', label: 'Eliminar', icon: 'delete' },
  ];

  protected readonly emptyTitle = 'Sin marcas';
  protected readonly emptyMessage = 'No hay marcas que coincidan con el filtro actual.';

  onAction(event: TableActionEvent<Brand>): void {
    this.actionClicked.emit(event);
  }
}
