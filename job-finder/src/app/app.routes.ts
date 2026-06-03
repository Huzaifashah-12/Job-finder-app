import { Routes } from '@angular/router';
import { SignUp } from './sign-up/sign-up';
import { SignIn } from './sign-in/sign-in';
import { Employer } from './employer/employer';
import { JobSeeker } from './job-seeker/job-seeker';
import { Home } from './home/home';
import { ForgotPassword } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // <-- default route
  { path: 'home', component: Home },
  { path: 'sign-up', component: SignUp },
  { path: 'sign-in', component: SignIn },
  { path: 'employer', component: Employer },
  { path: 'jobseeker', component: JobSeeker },
  { path: 'forgot-password', component: ForgotPassword },
  { path: '**', redirectTo: 'home' } // <-- fallback route for unknown URLs
];