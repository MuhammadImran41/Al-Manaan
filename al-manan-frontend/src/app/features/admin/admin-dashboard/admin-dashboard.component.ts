import { Component, OnInit } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  recentOrders: Order[]   = [];
  recentProducts: Product[] = [];
  stats = { totalOrders: 0, totalRevenue: 0, totalProducts: 0, lowStock: 0 };
  isLoading = true;
  weeklyData: { day: string; revenue: number; count: number; pct?: number }[] = [];

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private toastService: ToastService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.orderService.getAllOrders(1, 8).subscribe({
      next: res => {
        this.recentOrders        = res.items;
        this.stats.totalOrders   = res.totalCount;
        this.stats.totalRevenue  = res.items.reduce((s: number, o: Order) => s + o.totalAmount, 0);
        this.isLoading           = false;
        this.buildWeeklyChart(res.items);
      },
      error: () => (this.isLoading = false)
    });

    this.productService.getProducts({ pageSize: 8 }).subscribe({
      next: res => {
        this.recentProducts      = res.items;
        this.stats.totalProducts = res.totalCount;
        this.stats.lowStock      = res.items.filter((p: Product) => p.stockQuantity <= 5).length;
      }
    });
  }

  private buildWeeklyChart(orders: Order[]): void {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date().getDay();
    this.weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString());
      return {
        day: days[(today - 6 + i + 7) % 7],
        revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        count: dayOrders.length
      };
    });
    const max = Math.max(...this.weeklyData.map(d => d.revenue), 1);
    this.weeklyData.forEach(d => d.pct = Math.round((d.revenue / max) * 100));
  }

  // ---- Delete product ----
  deleteProduct(id: number, name: string): void {
    if (!confirm(`Delete "${name}"?\n\nThis cannot be undone.`)) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });
    this.http.delete(`${environment.apiUrl}/products/${id}`, { headers }).subscribe({
      next: () => {
        this.recentProducts = this.recentProducts.filter(p => p.id !== id);
        this.stats.totalProducts--;
        this.toastService.success(`"${name}" deleted`);
      },
      error: () => this.toastService.error('Failed to delete product')
    });
  }

  // ---- Delete order ----
  deleteOrder(id: number, orderNumber: string): void {
    if (!confirm(`Delete order "${orderNumber}"?\n\nThis cannot be undone.`)) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authService.token}` });
    this.http.delete(`${environment.apiUrl}/orders/${id}`, { headers }).subscribe({
      next: () => {
        this.recentOrders = this.recentOrders.filter(o => o.id !== id);
        this.stats.totalOrders--;
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
}
