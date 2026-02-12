import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent {
  form: FormGroup;
  submitted = false;
  loading = false;
  showPass = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  togglePassword() {
    this.showPass = !this.showPass;
  }

  submit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    const data = this.form.value;

    this.authService.loginWithCredentials(data.email, data.password).subscribe({
      next: (user) => {
        this.loading = false;

        const role = String(user.role).toLowerCase();

        if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'manager') {
          this.router.navigate(['/manager/dashboard']);
        } else {
          this.router.navigate(['/employee/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);

        let errorMessage = 'Login failed. Please try again.';

        // Handle different error types
        if (error.status === 0) {
          errorMessage =
            'Cannot connect to server. Please check:\n' +
            '1. Backend is running at https://localhost:7175\n' +
            '2. SSL certificate is trusted\n' +
            '3. CORS is configured on backend\n' +
            '4. Network connection is active';
        } else if (error.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.status === 400) {
          errorMessage =
            error.error?.message ||
            error.error ||
            'Invalid request. Please check your input.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }

        alert(errorMessage);
      },
    });
  }

  getControl(fieldName: string) {
    return this.form.get(fieldName);
  }

  isInvalid(fieldName: string): boolean {
    const field = this.getControl(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted)
    );
  }

  getError(fieldName: string): string {
    const field = this.getControl(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return (
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' is required'
      );
    }
    if (field.errors['minlength']) {
      return (
        'Minimum ' +
        field.errors['minlength'].requiredLength +
        ' characters needed'
      );
    }
    if (field.errors['email']) {
      return 'Please enter a valid email';
    }

    return 'Invalid field';
  }
}
