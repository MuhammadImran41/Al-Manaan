import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['../profile/profile.component.scss']
})
export class WishlistComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.wishlistService.loadWishlist().subscribe({
      next: p => { this.products = p; this.isLoading = false; },
      error: () => (this.isLoading = false)
    });
  }

  remove(productId: number): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== productId);
        this.toastService.info('Removed from wishlist');
      }
    });
  }
}
