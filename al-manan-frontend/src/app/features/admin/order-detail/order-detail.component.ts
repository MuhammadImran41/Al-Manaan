import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  isUpdating = false;
  selectedStatus = '';
  trackingNumber = '';

  statusOptions = ['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.orderService.getOrder(id).subscribe({
      next: o => { this.order = o; this.selectedStatus = o.status; this.isLoading = false; },
      error: () => (this.isLoading = false)
    });
  }

  updateStatus(): void {
    if (!this.order) return;
    this.isUpdating = true;
    this.orderService.updateOrderStatus(this.order.id, this.selectedStatus, this.trackingNumber).subscribe({
      next: updated => {
        this.order = updated;
        this.toastService.success('Order status updated');
        this.isUpdating = false;
      },
      error: () => (this.isUpdating = false)
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
