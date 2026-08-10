import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-admin-inventory',
  templateUrl: './admin-inventory.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class AdminInventoryComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;
  filter: 'all' | 'low' | 'out' = 'all';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts({ pageSize: 100 }).subscribe({
      next: res => { this.products = res.items; this.isLoading = false; },
      error: () => (this.isLoading = false)
    });
  }

  get totalProducts():    number { return this.products.length; }
  get inStockCount():     number { return this.products.filter(p => p.stockQuantity > 5).length; }
  get lowStockCount():    number { return this.products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length; }
  get outOfStockCount():  number { return this.products.filter(p => p.stockQuantity === 0).length; }
  get lowStockItems():    Product[] { return this.products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5); }

  get filteredProducts(): Product[] {
    if (this.filter === 'low') return this.products.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5);
    if (this.filter === 'out') return this.products.filter(p => p.stockQuantity === 0);
    return this.products;
  }

  stockBarWidth(qty: number): number {
    return Math.min(100, (qty / 50) * 100);
  }
}
