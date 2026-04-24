import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
}

@Component({
  selector: 'app-browse-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse-jobs.html',
})
export class BrowseJobs implements OnInit {

  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  recommendedJobs: Job[] = [];

  loadingRecommendations = false;

  showMatchNotification = false;
  noMatchNotification = false;

  JOBS_API = 'http://localhost:5000/api/jobs/all';
  RECOMMEND_API = 'http://localhost:5000/api/recommend-jobs';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getJobs();
  }

  // ----------------------
  // GET JOBS
  // ----------------------
  getJobs() {
    const token = this.authService.getToken();

    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : undefined;

    this.http.get<Job[]>(this.JOBS_API, { headers }).subscribe({
      next: (res) => {
        this.jobs = res || [];
        this.filteredJobs = this.jobs;

        this.loadRecommendations();
      },
      error: (err) => console.error(err),
    });
  }

  // ----------------------
  // AI RECOMMENDATIONS
  // ----------------------
  loadRecommendations() {
    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.loadingRecommendations = true;

    this.http.post<Job[]>(
      this.RECOMMEND_API,
      {
        jobs: this.jobs.slice(0, 20)
      },
      { headers }
    ).subscribe({
      next: (res) => {

        this.recommendedJobs = res || [];
        this.loadingRecommendations = false;

        // SUCCESS
        if (this.recommendedJobs.length > 0) {
          this.showMatchNotification = true;

          setTimeout(() => {
            this.showMatchNotification = false;
          }, 4000);
        }

        // NO MATCH
        else {
          this.noMatchNotification = true;

          setTimeout(() => {
            this.noMatchNotification = false;
          }, 4000);
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingRecommendations = false;
      }
    });
  }

  // ----------------------
  // SEARCH
  // ----------------------
  search(title: string) {
    this.filteredJobs = this.jobs.filter(job =>
      job.title.toLowerCase().includes(title.toLowerCase())
    );
  }

  // ----------------------
  // APPLY
  // ----------------------
  applyJob(jobId: string) {
    const token = this.authService.getToken();

    if (!token) {
      alert("Login first");
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(
      'http://localhost:5000/api/applications',
      { jobId },
      { headers }
    ).subscribe(() => {
      alert("Application submitted!");
    });
  }
}