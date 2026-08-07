import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatBadge } from '@angular/material/badge';
import { MatIconButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { ThemeManagerService } from '@core/services/theme-manager.service';
import { AuthStore } from '@core/state/auth/auth.store';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';
import { ThemeStore } from '@core/state/theme/theme.store';

import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BreadcrumbComponent,
    GlobalSearchComponent,
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
  protected readonly sidebarStore = inject(SidebarStore);
  protected readonly themeStore = inject(ThemeStore);
  protected readonly themeManager = inject(ThemeManagerService);
  protected readonly notificationsStore = inject(NotificationsStore);
  protected readonly authStore = inject(AuthStore);

  private readonly router = inject(Router);

  protected toggleTheme(): void {
    this.themeStore.setMode(this.themeManager.resolvedTheme() === 'dark' ? 'light' : 'dark');
  }

  protected onLogout(): void {
    this.authStore.logout();
    void this.router.navigate(['/login']);
  }
}
