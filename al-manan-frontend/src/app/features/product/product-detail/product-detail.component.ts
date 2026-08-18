import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { GuestCartService } from '../../../core/services/guest-cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, ProductVariant } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading = true;
  selectedImage = 0;
  selectedSize = '';
  selectedColor = '';
  quantity = 1;
  isAddingToCart = false;
  isWishlisted = false;
  activeTab = 'description';

  // Default sizes when no variants exist in DB
  defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private guestCart: GuestCartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['slug']);
    });
  }

  private loadProduct(slug: string): void {
    this.isLoading = true;
    this.productService.getProductBySlug(slug).subscribe({
      next: product => {
        this.product  = product;
        this.isLoading = false;
        if (product.variants?.length) {
          this.selectedSize  = product.variants[0].size;
          this.selectedColor = product.variants[0].color || '';
        }
        this.productService.getRelated(product.id).subscribe(
          rel => (this.relatedProducts = rel)
        );
      },
      error: () => { this.isLoading = false; this.router.navigate(['/shop']); }
    });
  }

  selectImage(index: number): void { this.selectedImage = index; }
  selectSize(size: string):   void { this.selectedSize  = size; }
  selectColor(color: string): void { this.selectedColor = color; }

  get availableSizes(): string[] {
    if (!this.product) return [];
    return [...new Set(this.product.variants.map(v => v.size))];
  }

  get availableColors(): { color: string; hex?: string }[] {
    if (!this.product) return [];
    const seen = new Set<string>();
    return this.product.variants
      .filter(v => v.color)
      .filter(v => { if (seen.has(v.color!)) return false; seen.add(v.color!); return true; })
      .map(v => ({ color: v.color!, hex: v.colorHex }));
  }

  get selectedVariant(): ProductVariant | null {
    return this.product?.variants.find(
      v => v.size === this.selectedSize && (!this.selectedColor || v.color === this.selectedColor)
    ) ?? null;
  }

  get currentPrice(): number {
    return (this.product?.salePrice ?? this.product?.price ?? 0)
         + (this.selectedVariant?.priceAdjustment ?? 0);
  }

  get currentMainImage(): string {
    if (!this.product) return 'assets/images/placeholder.svg';
    return this.product.images[this.selectedImage]?.imageUrl
        ?? this.product.mainImageUrl
        ?? 'assets/images/placeholder.svg';
  }

  addToCart(): void {
    const isUnstitched = this.product?.stitchType === 'Unstitched';
    const size = isUnstitched ? 'One Size' : this.selectedSize;
    if (!isUnstitched && !this.selectedSize) {
      this.toastService.warning('Please select a size');
      return;
    }
    this.isAddingToCart = true;
    this.guestCart.addItem(this.product!, size, this.quantity, this.selectedColor || undefined);
    this.toastService.success(`${this.product!.name} added to cart!`);
    setTimeout(() => (this.isAddingToCart = false), 600);
  }

  addToCartAndCheckout(): void {
    const isUnstitched = this.product?.stitchType === 'Unstitched';
    const size = isUnstitched ? 'One Size' : this.selectedSize;
    if (!isUnstitched && !this.selectedSize) {
      this.toastService.warning('Please select a size first');
      return;
    }
    this.guestCart.addItem(this.product!, size, this.quantity, this.selectedColor || undefined);
    this.router.navigate(['/checkout']);
  }

  toggleWishlist(): void {
    this.isWishlisted = !this.isWishlisted;
    this.toastService.info(this.isWishlisted ? '❤️ Added to wishlist' : 'Removed from wishlist');
  }

  changeQuantity(delta: number): void {
    const n = this.quantity + delta;
    if (n >= 1 && n <= (this.product?.stockQuantity ?? 99)) this.quantity = n;
  }
}
