import { FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { APP_CONFIG } from '@core/config/app.config';
import { NAVIGATION_ITEMS } from '@core/constants/navigation';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, MatIcon, MatTooltip],
})
export class SidebarComponent {
  protected readonly appConfig = inject(APP_CONFIG);
  protected readonly sidebarStore = inject(SidebarStore);
  protected readonly navItems = NAVIGATION_ITEMS;

  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly drawer = viewChild<ElementRef<HTMLElement>>('drawer');
  private focusTrap: FocusTrap | null = null;

  protected readonly collapsedClass = computed(() => {
    const viewport = this.sidebarStore.viewport();
    if (viewport === 'tablet') return true;
    if (viewport === 'desktop') return this.sidebarStore.isCollapsed();
    return false;
  });

  constructor() {
    effect(() => {
      const open = this.sidebarStore.isMobileOpen();
      const element = this.drawer();
      if (open && element) {
        this.focusTrap?.destroy();
        this.focusTrap = this.focusTrapFactory.create(element.nativeElement);
        this.focusTrap.focusInitialElement();
      } else if (!open && this.focusTrap) {
        this.focusTrap.destroy();
        this.focusTrap = null;
      }
    });
  }

  protected onNavigate(): void {
    this.sidebarStore.closeMobile();
  }
}
