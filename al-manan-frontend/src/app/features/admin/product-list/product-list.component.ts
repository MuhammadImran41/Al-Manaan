import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  deletingId: number | null = null;

  constructor(
    private productService: ProductService,
    private toastService: ToastService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.isLoading = true;
    this.currentPage = page;
    this.productService.getProducts({ pageNumber: page, pageSize: 15 }).subscribe({
      next: res => {
        this.products = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  deleteProduct(id: number, name: string): void {
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`)) return;

    this.deletingId = id;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });

    this.http.delete(`${environment.apiUrl}/products/${id}`, { headers }).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== id);
        this.totalCount--;
        this.toastService.success(`"${name}" deleted successfully`);
        this.deletingId = null;
      },
      error: () => {
        this.toastService.error('Failed to delete product');
        this.deletingId = null;
      }
    });
  }

  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}
