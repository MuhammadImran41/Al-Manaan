import {
  Component, Input, AfterViewInit, ElementRef, ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { GuestCartService } from '../../../core/services/guest-cart.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements AfterViewInit {
  @Input() product!: Product;
  @Input() animationDelay = 0;
  @ViewChild('cardEl') cardEl!: ElementRef<HTMLDivElement>;

  isWishlisted = false;
  isAddingToCart = false;

  constructor(
    private guestCart: GuestCartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    // 3D tilt DISABLED — causes scroll shake on Windows
  }

  get displayPrice(): number { return this.product.salePrice || this.product.price; }

  get discountPercent(): number | null {
    if (!this.product.salePrice) return null;
    return Math.round((1 - this.product.salePrice / this.product.price) * 100);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const firstVariant = this.product.variants?.[0];
    const size = firstVariant?.size || 'M';
    this.isAddingToCart = true;
    this.guestCart.addItem(this.product, size, 1, firstVariant?.color);
    this.toastService.success(`${this.product.name} added to cart`);
    setTimeout(() => (this.isAddingToCart = false), 600);
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isWishlisted = !this.isWishlisted;
    this.toastService.info(this.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  }

  navigateToProduct(): void {
    this.router.navigate(['/product', this.product.slug]);
  }
}
