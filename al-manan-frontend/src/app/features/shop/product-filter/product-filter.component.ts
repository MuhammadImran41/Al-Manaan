import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Category, ProductQueryParams } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() currentFilters: ProductQueryParams = {};
  @Output() filterApplied = new EventEmitter<Partial<ProductQueryParams>>();

  filterForm!: FormGroup;

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  priceRanges = [
    { label: 'Under PKR 2,000', min: 0, max: 2000 },
    { label: 'PKR 2,000 – 5,000', min: 2000, max: 5000 },
    { label: 'PKR 5,000 – 10,000', min: 5000, max: 10000 },
    { label: 'Above PKR 10,000', min: 10000, max: undefined }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      categoryId: [this.currentFilters.categoryId || null],
      size: [this.currentFilters.size || null],
      minPrice: [this.currentFilters.minPrice || null],
      maxPrice: [this.currentFilters.maxPrice || null]
    });
  }

  applyFilters(): void {
    const v = this.filterForm.value;
    this.filterApplied.emit({
      categoryId: v.categoryId || undefined,
      size: v.size || undefined,
      minPrice: v.minPrice || undefined,
      maxPrice: v.maxPrice || undefined
    });
  }

  setPriceRange(range: { min: number; max?: number }): void {
    this.filterForm.patchValue({ minPrice: range.min, maxPrice: range.max ?? null });
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filterApplied.emit({});
  }

  get parentCategories(): Category[] {
    return this.categories.filter(c => !c.parentCategoryId);
  }

  subCategories(parentId: number): Category[] {
    return this.categories.filter(c => c.parentCategoryId === parentId);
  }
}
