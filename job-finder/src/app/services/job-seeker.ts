import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.js';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobSeekerService {
  private API_URL = 'http://localhost:5000/api/jobseeker';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDashboard(): Observable<any> {
    const token = this.authService.getToken();
    return this.http.get(`${this.API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}