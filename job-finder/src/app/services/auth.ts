import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // makes it available everywhere
})
export class AuthService {

  private API_URL = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  // 🔹 Login API
  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, data);
  }

  // 🔹 Register API
  register(data: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  // 🔹 Save Token
  saveToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  }

  // 🔹 Get Token
  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // 🔹 Logout
  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  // 🔹 Check if logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}