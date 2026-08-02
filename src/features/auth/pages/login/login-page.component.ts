import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { APP_CONFIG } from '@core/config/app.config';

import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginFormComponent, MatIcon],
})
export class LoginPageComponent {
  protected readonly appConfig = inject(APP_CONFIG);
}
