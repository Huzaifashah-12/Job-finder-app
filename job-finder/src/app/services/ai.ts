import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Ai {
  constructor(private http: HttpClient) {}

  getJobSuggestions(file: File){

    const formData = new FormData();
    formData.append("cv", file);

    return this.http.post<any>(
      `${environment.apiUrl}/job-suggestions`,
      formData
    );
}
}
