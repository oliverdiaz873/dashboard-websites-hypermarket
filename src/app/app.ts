import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeManagerService } from '@core/services/theme-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class App {
  /**
   * Instancia ThemeManagerService al crear la app: su `effect()` aplica el tema
   * resuelto (`data-theme` + `color-scheme`) al documento. El shell depende del
   * sistema de tema.
   */
  private readonly themeManager = inject(ThemeManagerService);
}
