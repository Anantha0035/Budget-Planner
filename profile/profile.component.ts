import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { HttpClientModule } from '@angular/common/http';
import { ProfileService } from '../../profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SideNavComponent, MatSnackBarModule, HttpClientModule],
  providers: [ProfileService],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  profileForm: any;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      age: ['', [Validators.required, Validators.min(18), Validators.pattern('^[0-9]*$')]],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      occupation: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]*$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.profileService.createProfile(this.profileForm.value).subscribe(
        (response) => {
          this.openSnackBar('Profile created successfully!', 'Close');
        },
        (error) => {
          if (error.error && error.error.message === 'User already exists') {
            this.openSnackBar('User already exists!', 'Close');
          } else {
            this.openSnackBar('Failed to create profile!', 'Close');
          }
        }
      );
    } else {
      this.displayValidationErrors();
    }
  }

  displayValidationErrors() {
    if (this.profileForm.controls.name.hasError('pattern')) {
      this.openSnackBar('Please enter only text for name!', 'Close');
    } else if (this.profileForm.controls.age.hasError('pattern')) {
      this.openSnackBar('Please enter only numbers for age!', 'Close');
    } else if (this.profileForm.controls.age.hasError('min')) {
      this.openSnackBar('Age must be at least 18!', 'Close');
    } else if (this.profileForm.controls.email.hasError('email')) {
      this.openSnackBar('Please enter a valid email address!', 'Close');
    } else if (this.profileForm.controls.contact.hasError('pattern')) {
      this.openSnackBar('Please enter only numbers for contact!', 'Close');
    } else if (this.profileForm.invalid) {
      this.openSnackBar('Please fill in all fields correctly!', 'Close');
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
}
