import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMsg = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Build form
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Already admin — skip login
    if (this.authService.isLoggedIn && this.authService.isAdmin) {
      this.router.navigateByUrl('/admin');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isLoading = true;
    this.errorMsg  = '';

    this.authService.login(this.form.value).subscribe({
      next: user => {
        const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
        if (roles.some((r: any) => r === 'Admin')) {
          this.router.navigateByUrl('/admin');
        } else {
          this.authService.logout();
          this.errorMsg = 'Access denied. Admin credentials required.';
          this.isLoading = false;
        }
      },
      error: () => {
        this.errorMsg = 'Invalid email or password.';
        this.isLoading = false;
      }
    });
  }
}
