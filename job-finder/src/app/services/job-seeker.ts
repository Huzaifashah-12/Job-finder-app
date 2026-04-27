import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.js';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobSeekerService {
  private API_URL = `${environment.apiUrl}/jobseeker`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getDashboard(): Observable<any> {
    const token = this.authService.getToken();
    return this.http.get(`${this.API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}