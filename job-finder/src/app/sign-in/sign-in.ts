import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink // ✅ FIX: REQUIRED for routerLink to work
  ],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
})
export class SignIn {

  signInForm: FormGroup;
  errorMessage = '';
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // -------------------------
  // LOGIN SUBMIT
  // -------------------------
  onSubmit(): void {

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.signInForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (res) => {

        if (!res.token) {
          this.errorMessage = 'No token received from server';
          return;
        }

        // save token
        this.authService.saveToken(res.token, rememberMe);

        // role-based redirect
        const role = (res.role || '').toLowerCase().trim();

        if (role === 'seeker') {
          this.router.navigate(['/jobseeker']);
        } else if (role === 'recruiter') {
          this.router.navigate(['/employer']);
        } else {
          this.router.navigate(['/home']);
        }
      },

      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed';
        console.error('Login error:', this.errorMessage);
      }
    });
  }
}