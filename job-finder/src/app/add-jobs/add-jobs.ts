import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-add-jobs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-jobs.html',
})
export class AddJobs implements OnInit {

  jobForm!: FormGroup;
  API = 'http://localhost:5000/api/jobs';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  postJob() {
    if (this.jobForm.invalid) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post(this.API, this.jobForm.value, { headers })
      .subscribe({
        next: () => alert('Job Posted Successfully'),
        error: err => alert(err.error.message)
      });
  }
}