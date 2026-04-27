import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './application.html',
  styleUrls: ['./application.css']
})
export class Application implements OnInit {

  applications: any[] = [];
  API = `${environment.apiUrl}/applications/recruiter`; // Updated route
  /** Backend serves files under /uploads (not site root). */
  private readonly API_ORIGIN = environment.apiOrigin;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications() {
   const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (!token) return alert('You must be logged in');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(this.API, { headers }).subscribe({
      next: (res) => {
        this.applications = res.map(app => ({
          jobTitle: app.jobId?.title,
          companyId: app.jobId?.companyId,
          applicantName: app.userId?.fullName,
          email: app.userId?.email,
          cv: app.cv,
          cvUrl:
            app.cvUrl ||
            (app.cv
              ? `${this.API_ORIGIN}/uploads/${encodeURIComponent(app.cv)}`
              : ''),
          status: app.status
        }));
      },
      error: (err) => {
        console.error('Failed to load applications', err);
        alert('Failed to load applications');
      }
    });
  }
}