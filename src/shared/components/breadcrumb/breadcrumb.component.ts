import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { ActivationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

import { NAVIGATION_ITEMS } from '@core/constants/navigation';

interface BreadcrumbCrumb {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon],
})
export class BreadcrumbComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly crumbs = signal<BreadcrumbCrumb[]>([]);

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof ActivationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.computeCrumbs());
    this.computeCrumbs();
  }

  private computeCrumbs(): void {
    const crumbs: BreadcrumbCrumb[] = [{ label: 'Inicio', route: '/dashboard' }];
    const path = this.router.url.split('?')[0];
    let current = '';
    for (const segment of path.split('/').filter(Boolean)) {
      current += `/${segment}`;
      const nav = NAVIGATION_ITEMS.find((item) => item.route === current);
      const isLast = current === path;
      crumbs.push({
        label: nav?.label ?? segment,
        route: isLast ? undefined : current,
      });
    }
    this.crumbs.set(crumbs);
  }
}
