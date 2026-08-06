import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

export interface BuyerProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  street: string;
  postalCode: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  userId?: string;
  createdAt: string;
}

@Component({
  selector: 'app-buyer-profiles',
  templateUrl: './buyer-profiles.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class BuyerProfilesComponent implements OnInit {
  profiles: BuyerProfile[] = [];
  isLoading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  searchQuery = '';
  selectedProfile: BuyerProfile | null = null;

  private baseUrl = `${environment.apiUrl}/buyerprofiles`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void { this.loadPage(1); }

  private get headers() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` }) };
  }

  loadPage(page: number): void {
    this.isLoading = true;
    this.currentPage = page;
    const params = `?pageNumber=${page}&pageSize=20${this.searchQuery ? '&search=' + this.searchQuery : ''}`;

    this.http.get<any>(`${this.baseUrl}${params}`, this.headers).subscribe({
      next: res => {
        this.profiles   = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.isLoading  = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPage(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadPage(1);
  }

  viewProfile(p: BuyerProfile): void {
    this.selectedProfile = p;
  }

  closeProfile(): void {
    this.selectedProfile = null;
  }

  deleteProfile(id: number, name: string): void {
    if (!confirm(`Delete buyer profile for "${name}"?\n\nThis will remove their profile data.`)) return;

    this.http.delete(`${this.baseUrl}/${id}`, this.headers).subscribe({
      next: () => {
        this.profiles = this.profiles.filter(p => p.id !== id);
        this.totalCount--;
        this.toastService.success(`Profile for "${name}" deleted`);
        if (this.selectedProfile?.id === id) this.selectedProfile = null;
      },
      error: () => this.toastService.error('Failed to delete profile')
    });
  }

  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}
