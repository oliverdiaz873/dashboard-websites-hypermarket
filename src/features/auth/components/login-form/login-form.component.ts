import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { APP_CONFIG } from '@core/config/app.config';
import { AuthStore } from '@core/state/auth/auth.store';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatIcon,
    MatFormField,
    MatLabel,
    MatError,
    MatPrefix,
    MatSuffix,
    MatInput,
  ],
})
export class LoginFormComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly appConfig = inject(APP_CONFIG);

  protected readonly form = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  protected readonly loading = this.authStore.isLoading;
  protected errorMessage: string | null = null;

  /** Preferencias puramente visuales (no alteran la persistencia de la sesión). */
  protected readonly showPassword = signal(false);
  protected readonly rememberMe = signal(true);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.errorMessage = null;

    try {
      await this.authStore.login({ email: email ?? '', password: password ?? '' });
      const target = isSafeReturnUrl(this.returnUrl) ? this.returnUrl : '/dashboard';
      await this.router.navigateByUrl(target);
    } catch (error) {
      this.errorMessage = toMessage(error);
    }
  }

  private get returnUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('returnUrl');
  }
}

/** Solo admite rutas internas: `/foo` sí; `//evil.com` o strings raros, no. */
function isSafeReturnUrl(url: string | null): url is string {
  return !!url && url.startsWith('/') && !url.startsWith('//');
}

function toMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { message?: string } | null;
    return body?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}
