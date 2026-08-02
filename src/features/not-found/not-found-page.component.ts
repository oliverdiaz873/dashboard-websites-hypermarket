import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIcon, MatButton, EmptyStateComponent],
})
export class NotFoundPageComponent {}
