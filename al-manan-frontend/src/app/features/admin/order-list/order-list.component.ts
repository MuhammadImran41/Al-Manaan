import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/order.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void { this.loadPage(1); }

  loadPage(page: number): void {
    this.isLoading = true;
    this.currentPage = page;
    this.orderService.getAllOrders(page, 15).subscribe({
      next: res => {
        this.orders = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  deleteOrder(id: number, orderNumber: string): void {
    if (!confirm(`Delete order "${orderNumber}"?\n\nThis will permanently remove the order record.`)) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });
    this.http.delete(`${environment.apiUrl}/orders/${id}`, { headers }).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== id);
        this.totalCount--;
        this.toastService.success(`Order ${orderNumber} deleted`);
      },
      error: () => this.toastService.error('Failed to delete order')
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge--muted', Confirmed: 'badge--gold', Processing: 'badge--gold',
      Shipped: 'badge--new', Delivered: 'badge--success', Cancelled: 'badge--red'
    };
    return map[status] ?? 'badge--muted';
  }

  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
}
