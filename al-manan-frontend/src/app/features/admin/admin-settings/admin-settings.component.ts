import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class AdminSettingsComponent implements OnInit {
  activeTab: 'store' | 'account' | 'notifications' | 'shipping' = 'store';
  isSaving = false;

  storeForm!: FormGroup;
  accountForm!: FormGroup;
  shippingForm!: FormGroup;
  notifForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.storeForm = this.fb.group({
      storeName:     ['Al-Manan', Validators.required],
      storeEmail:    ['almananshop@gmail.com', [Validators.required, Validators.email]],
      storePhone:    ['03171656231'],
      storeAddress:  ['Pakistan'],
      currency:      ['PKR'],
      taxRate:       [0],
    });

    this.accountForm = this.fb.group({
      firstName:       ['Al-Manan', Validators.required],
      lastName:        ['Admin', Validators.required],
      email:           ['admin@almanan.com', [Validators.required, Validators.email]],
      currentPassword: [''],
      newPassword:     ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    });

    this.shippingForm = this.fb.group({
      freeShippingThreshold: [5000],
      standardShipping:      [200],
      expressShipping:       [400],
      codAvailable:          [true],
      deliveryDaysLocal:     ['2-3'],
      deliveryDaysNational:  ['3-5'],
      deliveryDaysRemote:    ['5-7']
    });

    this.notifForm = this.fb.group({
      newOrderEmail:    [true],
      newOrderSms:      [false],
      lowStockAlert:    [true],
      lowStockThreshold:[5],
      dailyReport:      [false]
    });
  }

  saveStore(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.toastService.success('Store settings saved!');
      this.isSaving = false;
    }, 600);
  }

  saveShipping(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.toastService.success('Shipping settings saved!');
      this.isSaving = false;
    }, 600);
  }

  saveNotifications(): void {
    this.isSaving = true;
    setTimeout(() => {
      this.toastService.success('Notification preferences saved!');
      this.isSaving = false;
    }, 600);
  }

  saveAccount(): void {
    if (this.accountForm.get('newPassword')?.value &&
        this.accountForm.get('newPassword')?.value !== this.accountForm.get('confirmPassword')?.value) {
      this.toastService.error('Passwords do not match');
      return;
    }
    this.isSaving = true;

    const firstName = this.accountForm.get('firstName')?.value;
    const lastName  = this.accountForm.get('lastName')?.value;
    const currentPw = this.accountForm.get('currentPassword')?.value;
    const newPw     = this.accountForm.get('newPassword')?.value;

    // Update profile name
    this.http.put(`${environment.apiUrl}/auth/profile`, { firstName, lastName }).subscribe({
      next: () => {
        // Change password if provided
        if (currentPw && newPw) {
          this.http.post(`${environment.apiUrl}/auth/change-password`, {
            currentPassword: currentPw,
            newPassword: newPw
          }).subscribe({
            next: () => {
              this.toastService.success('Account & password updated!');
              this.isSaving = false;
              // Clear password fields
              this.accountForm.patchValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
            },
            error: (e) => {
              this.isSaving = false;
              const msg = e?.error?.message || 'Password change failed';
              this.toastService.error(msg);
            }
          });
        } else {
          this.toastService.success('Profile updated!');
          this.isSaving = false;
        }
      },
      error: () => {
        this.isSaving = false;
        this.toastService.error('Failed to update profile');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
