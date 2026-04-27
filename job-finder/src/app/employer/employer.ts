import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { RegisterCompany } from '../register-company/register-company';
import { AddJobs } from '../add-jobs/add-jobs';
import { MyJobs } from '../my-jobs/my-jobs';
import { Application } from '../application/application';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-employer',
  templateUrl: './employer.html',
  imports: [CommonModule, RegisterCompany, AddJobs, MyJobs, Application],
})
export class Employer implements OnInit {

  currentSection: string = 'dashboard';
  token: string | null = null;

  totalJobs: number = 0;
  activeJobs: number = 0;
  totalApplications: number = 0;
  companyName: string = '';

  jobs: any[] = [];
  API_JOBS = `${environment.apiUrl}/jobs`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.authService.getToken();
    if (!this.token) {
      this.router.navigate(['/sign-in']);
      return;
    }
    this.loadDashboard();
  }

  showSection(section: string) {
    this.currentSection = section;
    if (section === 'my-jobs') this.loadJobs();
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('user');
    this.router.navigate(['/sign-in']);
  }

  getHeaders() {
    return { headers: new HttpHeaders().set('Authorization', `Bearer ${this.token}`) };
  }

  loadDashboard() {
    this.http.get<any>(`${this.API_JOBS}/stats`, this.getHeaders())
      .subscribe({
        next: (res) => {
          this.companyName = res.companyName || '';
          this.totalJobs = res.totalJobs || 0;
          this.activeJobs = res.activeJobs || 0;
          this.totalApplications = res.totalApplications || 0;
        },
        error: (err) => console.error('Dashboard error', err)
      });
  }

  loadJobs() {
    this.http.get<any[]>(this.API_JOBS, this.getHeaders())
      .subscribe({
        next: (res) => this.jobs = res,
        error: (err) => console.error('Jobs load error', err)
      });
  }

}