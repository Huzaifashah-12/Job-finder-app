import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.css'],
})
export class MyApplications implements OnInit {

  applications: any[] = [];
  API = 'http://localhost:5000/api/applications/me';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications() {
    const token = this.authService.getToken();

    if (!token) {
      alert('You must be logged in');
      this.router.navigate(['/sign-in']);
      return;
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    this.http.get<any[]>(this.API, { headers }).subscribe({
      next: (res) => {
        this.applications = res.map(app => ({
          id: app._id,
          jobTitle: app.jobId?.title,
          company: app.jobId?.companyId?.name || 'N/A',
          status: app.status,
          cvUrl: app.cvUrl
        }));
      },
      error: (err) => {
        console.error('Error loading applications', err);

        if (err.status === 401) {
          alert('Session expired. Please login again.');
          this.authService.logout();
          this.router.navigate(['/sign-in']);
        }
      }
    });
  }

}