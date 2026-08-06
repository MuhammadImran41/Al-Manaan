import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn) this.router.navigateByUrl('/');

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName:  ['', [Validators.required, Validators.minLength(2)]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['']
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: user => {
        this.toastService.success(`Welcome to Al-Manan, ${user.firstName}!`);
        this.router.navigateByUrl('/');
      },
      error: () => (this.isLoading = false)
    });
  }

  fieldError(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!(c?.invalid && c.touched);
  }
}
