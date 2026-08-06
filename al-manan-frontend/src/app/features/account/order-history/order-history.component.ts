import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['../profile/profile.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: orders => { this.orders = orders; this.isLoading = false; },
      error: () => (this.isLoading = false)
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      Pending: 'badge--muted',
      Confirmed: 'badge--gold',
      Processing: 'badge--gold',
      Shipped: 'badge--new',
      Delivered: 'badge--success',
      Cancelled: 'badge--red',
      Refunded: 'badge--muted'
    };
    return map[status] ?? 'badge--muted';
  }
}
