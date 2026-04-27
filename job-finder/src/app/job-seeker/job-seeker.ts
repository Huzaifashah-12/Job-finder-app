import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { BrowseJobs } from '../browse-jobs/browse-jobs';
import { MyApplications } from '../my-applications/my-applications';
import { MyProfile } from '../my-profile/my-profile';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-job-seeker',
  standalone: true,
  imports: [CommonModule, HttpClientModule, BrowseJobs, MyApplications, MyProfile],
  templateUrl: './job-seeker.html',
  styleUrls: ['./job-seeker.css'],
})
export class JobSeeker implements OnInit {
  currentSection: 'dashboard' | 'browse' | 'applications' | 'profile' = 'dashboard';

  appliedJobs: any[] = [];
  savedJobs: any[] = [];
  profile: any;
  appliedStats: { totalApplications: number; activeJobs: number } = {
    totalApplications: 0,
    activeJobs: 0,
  };

  private baseUrl = environment.apiUrl; // backend URL

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  showSection(section: 'dashboard' | 'browse' | 'applications' | 'profile') {
    this.currentSection = section;
    if (section === 'dashboard') this.loadDashboard();
  }

  loadDashboard() {
    const token = this.authService.getToken(); // checks both localStorage and sessionStorage
    if (!token) {
      this.router.navigate(['/sign-in']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Fetch dashboard stats
    this.http.get(`${this.baseUrl}/jobseeker/dashboard`, { headers }).subscribe({
      next: (data: any) => {
        this.appliedJobs = data.appliedJobs || [];
        this.savedJobs = data.savedJobs || [];
        this.appliedStats = {
          totalApplications: data.totalApplications || 0,
          activeJobs: data.activeJobs || 0,
        };
      },
      error: (err) => {
        console.error('Error fetching dashboard:', err);
        if (err.status === 401) this.router.navigate(['/sign-in']);
      },
    });

    // Fetch profile info
    this.http.get(`${this.baseUrl}/profile`, { headers }).subscribe({
      next: (data) => (this.profile = data),
      error: (err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 401) this.router.navigate(['/sign-in']);
      },
    });
  }

  logout() {
    this.authService.logout(); // clears both local and session storage
    this.router.navigate(['/sign-in']);
  }
}