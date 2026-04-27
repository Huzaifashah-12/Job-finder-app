import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-company.html',
})
export class RegisterCompany implements OnInit {

  companyForm!: FormGroup;
  API = `${environment.apiUrl}/company`;

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      industry: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  registerCompany() {
    if (this.companyForm.invalid) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.API, this.companyForm.value, { headers })
      .subscribe({
        next: () => alert('Company Registered Successfully'),
        error: err => alert(err.error.message)
      });
  }
}