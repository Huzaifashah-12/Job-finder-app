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
  API = `${environment.apiUrl}/applications/recruiter`;

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
        this.applications = res.map(app => {
          let finalCvUrl = '';
          if (app.cv) {
            if (app.cv.startsWith('http')) {
              finalCvUrl = app.cv;
            } else {
              finalCvUrl = `${environment.apiUrl}/uploads/${encodeURIComponent(app.cv)}`;
            }
          } else if (app.cvUrl) {
            finalCvUrl = app.cvUrl; // fallback
          }

          return {
            jobTitle: app.jobId?.title,
            companyId: app.jobId?.companyId,
            applicantName: app.userId?.fullName,
            email: app.userId?.email,
            cv: app.cv,
            cvUrl: finalCvUrl,
            status: app.status
          };
        });
      },
      error: (err) => {
        console.error('Failed to load applications', err);
        alert('Failed to load applications');
      }
    });
  }
}