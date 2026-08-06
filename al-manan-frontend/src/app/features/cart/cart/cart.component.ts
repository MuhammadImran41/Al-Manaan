import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GuestCartService, GuestCart, GuestCartItem } from '../../../core/services/guest-cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: GuestCart | null = null;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private guestCart: GuestCartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.guestCart.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.cart = c));
  }

  updateQuantity(item: GuestCartItem, qty: number): void {
    if (qty < 1) return;
    this.guestCart.updateItem(item.id, qty);
  }

  removeItem(itemId: number): void {
    this.guestCart.removeItem(itemId);
    this.toastService.info('Item removed from cart');
  }

  clearCart(): void {
    this.guestCart.clear();
    this.toastService.info('Cart cleared');
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }

  get subtotal(): number   { return this.cart?.subTotal ?? 0; }
  get shippingCost(): number { return this.subtotal >= 3000 ? 0 : 200; }
  get total(): number      { return this.subtotal + this.shippingCost; }
  isUpdating(_: number): boolean { return false; }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
