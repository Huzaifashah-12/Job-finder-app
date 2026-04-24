import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-my-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-jobs.html',
})
export class MyJobs implements OnInit {

  jobs: any[] = [];
  API = 'http://localhost:5000/api/jobs';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getJobs();
  }

  getJobs() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(this.API, { headers })
      .subscribe({
        next: res => this.jobs = res,
        error: err => console.error('Error fetching jobs', err)
      });
  }

  deleteJob(id: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (!confirm('Are you sure you want to delete this job?')) return;

    this.http.delete(`${this.API}/${id}`, { headers })
      .subscribe({
        next: () => {
          alert('Job Deleted');
          this.getJobs();
        },
        error: err => console.error('Delete failed', err)
      });
  }

  // Placeholder for editing a job
  editJob(id: string) {
    console.log('Edit job with ID:', id);
    // You can later open a modal or navigate to an edit page
  }
}