import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';

import { SidebarStore, type SidebarViewport } from '@core/state/sidebar/sidebar.store';

import { LoadingOverlayComponent } from '@shared/components/loading-overlay/loading-overlay.component';
import { SidebarComponent } from '@shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '@shared/components/topbar/topbar.component';

const DESKTOP_QUERY = '(min-width: 1200px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1199.98px)';
const MOBILE_QUERY = '(max-width: 767.98px)';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, LoadingOverlayComponent],
})
export class AdminLayoutComponent {
  protected readonly sidebarStore = inject(SidebarStore);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly shellState = computed(() => {
    const viewport = this.sidebarStore.viewport();
    const collapsed =
      viewport === 'tablet' || (viewport === 'desktop' && this.sidebarStore.isCollapsed());
    return {
      'hs-shell--mobile': viewport === 'mobile',
      'hs-shell--tablet': viewport === 'tablet',
      'hs-shell--desktop': viewport === 'desktop',
      'hs-shell--sidebar-collapsed': collapsed,
    };
  });

  constructor() {
    this.breakpointObserver
      .observe([DESKTOP_QUERY, TABLET_QUERY, MOBILE_QUERY])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        const { breakpoints } = result;
        let viewport: SidebarViewport;
        if (breakpoints[DESKTOP_QUERY]) {
          viewport = 'desktop';
        } else if (breakpoints[TABLET_QUERY]) {
          viewport = 'tablet';
        } else {
          viewport = 'mobile';
        }
        this.sidebarStore.setViewport(viewport);
      });

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        this.sidebarStore.closeMobile();
      }
    };
    document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => document.removeEventListener('keydown', onKeydown));
  }
}
