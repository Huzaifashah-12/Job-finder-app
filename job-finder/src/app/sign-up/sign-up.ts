import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrls: ['./sign-up.css'], // ✅ FIXED (was styleUrl)
})
export class SignUp {

  signupForm: FormGroup;
  errorMessage = '';
  loading = false; // ✅ better UX

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.signupForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        role: ['seeker', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // -----------------------------
  // PASSWORD MATCH VALIDATOR
  // -----------------------------
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword
      ? null
      : { mismatch: true };
  }

  // -----------------------------
  // SUBMIT FORM
  // -----------------------------
  onSubmit(): void {

    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { confirmPassword, ...signupData } = this.signupForm.value;

    this.authService.register(signupData).subscribe({
      next: (res) => {

        this.loading = false;

        console.log('Registration successful:', res);

        // save token
        this.authService.saveToken(res.token, true);

        // redirect based on role
        if (res.role === 'seeker') {
          this.router.navigate(['/jobseeker']);
        } else if (res.role === 'recruiter') {
          this.router.navigate(['/employer']);
        } else {
          this.router.navigate(['/home']);
        }
      },

      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Registration failed';
        console.error(this.errorMessage);
      }
    });
  }
}