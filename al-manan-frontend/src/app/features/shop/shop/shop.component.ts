import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category, ProductQueryParams } from '../../../core/models/product.model';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss']
})
export class ShopComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  totalCount = 0;
  totalPages = 0;
  currentPage = 1;
  isFilterOpen = false;

  queryParams: ProductQueryParams = {
    pageNumber: 1,
    pageSize: 12,
    sortBy: 'newest'
  };

  sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Popular', value: 'popular' },
    { label: 'Top Rated', value: 'rating' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productService.getCategories().subscribe(cats => (this.categories = cats));

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.queryParams = {
        ...this.queryParams,
        pageNumber: 1,
        gender: params['gender'],
        categoryId: params['categoryId'] ? +params['categoryId'] : undefined,
        search: params['search'],
        isNew: params['isNew'] === 'true' ? true : undefined,
        isFeatured: params['isFeatured'] === 'true' ? true : undefined,
        isBestSeller: params['isBestSeller'] === 'true' ? true : undefined,
        sortBy: params['sortBy'] || 'newest'
      };
      this.loadProducts();
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts(this.queryParams).subscribe({
      next: res => {
        this.products = res.items;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.currentPage = res.currentPage;
        this.isLoading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => (this.isLoading = false)
    });
  }

  onSortChange(sortBy: string): void {
    this.queryParams = { ...this.queryParams, sortBy, pageNumber: 1 };
    this.loadProducts();
  }

  onFilterApply(filters: Partial<ProductQueryParams>): void {
    this.queryParams = { ...this.queryParams, ...filters, pageNumber: 1 };
    this.loadProducts();
    this.isFilterOpen = false;
  }

  onPageChange(page: number): void {
    this.queryParams = { ...this.queryParams, pageNumber: page };
    this.loadProducts();
  }

  toggleFilter(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  get pageTitle(): string {
    if (this.queryParams.gender === 'women') return "Women's Collection";
    if (this.queryParams.gender === 'men') return "Men's Collection";
    if (this.queryParams.isNew) return 'New Arrivals';
    if (this.queryParams.isBestSeller) return 'Best Sellers';
    if (this.queryParams.isFeatured) return 'Featured';
    if (this.queryParams.search) return `Results for "${this.queryParams.search}"`;
    return 'All Products';
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
