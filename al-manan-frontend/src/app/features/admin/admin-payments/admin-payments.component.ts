import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Payment {
  id: number;
  orderNumber: string;
  customerName: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = true;
  totalRevenue = 0;
  totalOrders  = 0;
  pendingCount = 0;
  paidCount    = 0;
  currentPage  = 1;
  totalPages   = 1;
  filterStatus = 'all';
  filterMethod = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadPayments(); }

  loadPayments(): void {
    this.isLoading = true;
    this.http.get<any>(`${environment.apiUrl}/orders?pageNumber=${this.currentPage}&pageSize=20`).subscribe({
      next: res => {
        const orders = res?.items || [];
        this.totalOrders  = res?.totalCount || 0;
        this.totalPages   = res?.totalPages || 1;

        this.payments = orders.map((o: any) => ({
          id:           o.id,
          orderNumber:  o.orderNumber,
          customerName: o.shippingAddress?.fullName || 'Guest',
          amount:       o.totalAmount,
          method:       o.paymentMethod || 'COD',
          status:       o.paymentStatus || 'Pending',
          date:         o.createdAt
        }));

        this.totalRevenue = orders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
        this.paidCount    = orders.filter((o: any) => o.paymentStatus === 'Paid').length;
        this.pendingCount = orders.filter((o: any) => o.paymentStatus === 'Pending').length;
        this.isLoading    = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  get filteredPayments(): Payment[] {
    return this.payments.filter(p => {
      const statusOk = this.filterStatus === 'all' || p.status.toLowerCase() === this.filterStatus;
      const methodOk = this.filterMethod === 'all' || p.method.toLowerCase().includes(this.filterMethod);
      return statusOk && methodOk;
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Paid: 'badge--success', Pending: 'badge--muted',
      Failed: 'badge--red', Refunded: 'badge--gold'
    };
    return map[status] ?? 'badge--muted';
  }

  methodIcon(method: string): string {
    if (method?.toLowerCase().includes('jazz'))  return 'JazzCash';
    if (method?.toLowerCase().includes('easy'))  return 'EasyPaisa';
    if (method?.toLowerCase().includes('card'))  return 'Card';
    return 'COD';
  }
}
