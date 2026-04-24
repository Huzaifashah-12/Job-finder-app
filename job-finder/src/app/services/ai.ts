import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class Ai {
  constructor(private http: HttpClient) {}

  getJobSuggestions(file: File){

    const formData = new FormData();
    formData.append("cv", file);

    return this.http.post<any>(
      "http://localhost:5000/api/job-suggestions",
      formData
    );
}
}
