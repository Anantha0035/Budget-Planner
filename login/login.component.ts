import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../auth.service';
import { UserCredential } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.Emulated
})
export class LoginComponent {
  loginForm: any;
  registerForm: any;
  activeForm: 'login' | 'register' = 'login';
  authService = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  toggleForm(form: 'login' | 'register') {
    this.activeForm = form;
  }

  login() {
    if (this.loginForm.valid) {
      const rawForm = this.loginForm.getRawValue()
      this.authService.logins(rawForm.email, rawForm.password).subscribe({
        next: () => {
          if (this.authService.firebaseAuth.currentUser?.emailVerified) {
            this.router.navigate(['/budget-planner/dashboard']);
          } else {
            this.snackBar.open('Please verify your email!', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.snackBar.open('Invalid email or password!', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Invalid email or password!', 'Close', { duration: 3000 });
    }
  }

  register() {
    if (this.registerForm.valid) {
      const rawForm = this.registerForm.getRawValue()
      this.authService.registers(rawForm.email, rawForm.username, rawForm.password).subscribe({
        next: () => {
          this.snackBar.open('Registered Successfully! Please check your email for verification.', 'Close', { duration: 3000 });
          this.toggleForm('login');
        },
        error: (err) => {
          this.snackBar.open('Error occurred while registering!', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Please fill in all fields correctly!', 'Close', { duration: 3000 });
    }
  }

  forgotPassword() {
    const email = this.loginForm.get('email').value;
    this.authService.resetPassword(email).then(() => {
        this.snackBar.open('Password reset email sent!', 'Close', { duration: 3000 });
    }).catch((error) => {
        this.snackBar.open(error.message, 'Close', { duration: 3000 });
    });
}
  
}
