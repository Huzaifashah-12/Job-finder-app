import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.css']
})
export class MyProfile implements OnInit {

  profileForm!: FormGroup;
  selectedFile: File | null = null;
  fileError: string = '';
  isEditing = false;
  originalData: any;

  private API = 'http://localhost:5000/api/profile';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.loadProfile();
  }

  loadProfile() {
    const token = this.authService.getToken(); // checks both localStorage and sessionStorage
    if (!token) return; // user not logged in

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(this.API, { headers }).subscribe({
      next: res => {
        if (res) {
          this.profileForm.patchValue(res);
          this.originalData = res;
          this.profileForm.disable();
        }
      },
      error: err => console.error('Error loading profile', err)
    });
  }

  enableEdit() {
    this.isEditing = true;
    this.profileForm.enable();
  }

  cancelEdit() {
    this.isEditing = false;
    this.profileForm.patchValue(this.originalData);
    this.profileForm.disable();
    this.fileError = '';
    this.selectedFile = null;
  }

  onFileSelect(event: any) {
    this.fileError = '';
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Only PDF or Word (.doc, .docx) files are allowed.';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  updateProfile() {
    if (this.profileForm.invalid || this.fileError) return;

    const token = this.authService.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('fullName', this.profileForm.value.fullName);
    formData.append('email', this.profileForm.value.email);

    if (this.selectedFile) formData.append('cv', this.selectedFile);

    this.http.put(this.API, formData, { headers }).subscribe({
      next: (res: any) => {
        alert('Profile Updated Successfully');
        this.isEditing = false;
        this.profileForm.disable();
        this.originalData = res;
        this.selectedFile = null;
      },
      error: err => console.error('Update failed', err)
    });
  }
}