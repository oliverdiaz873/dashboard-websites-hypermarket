import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';

import { APP_CONFIG } from '@core/config/app.config';
import { ThemeManagerService } from '@core/services/theme-manager.service';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';
import { ThemeStore } from '@core/state/theme/theme.store';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbComponent,
    MatBadge,
    MatDivider,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
  ],
})
export class TopbarComponent {
  protected readonly appConfig = inject(APP_CONFIG);
  protected readonly sidebarStore = inject(SidebarStore);
  protected readonly themeStore = inject(ThemeStore);
  protected readonly themeManager = inject(ThemeManagerService);
  protected readonly notificationsStore = inject(NotificationsStore);

  protected toggleTheme(): void {
    this.themeStore.setMode(this.themeManager.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }
}
