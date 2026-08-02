import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthStore } from '@core/state/auth/auth.store';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButton, MatIcon, MatFormField, MatLabel, MatError, MatInput],
})
export class LoginFormComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { validators: [Validators.required] }),
  });

  protected readonly loading = this.authStore.isLoading;
  protected errorMessage: string | null = null;

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.errorMessage = null;

    try {
      await this.authStore.login({ email: email ?? '', password: password ?? '' });
      await this.router.navigateByUrl(this.returnUrl ?? '/dashboard');
    } catch (error) {
      this.errorMessage = toMessage(error);
    }
  }

  private get returnUrl(): string | null {
    return this.route.snapshot.queryParamMap.get('returnUrl');
  }
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
