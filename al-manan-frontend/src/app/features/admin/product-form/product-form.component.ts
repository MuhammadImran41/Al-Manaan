import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isSaving = false;
  isEdit = false;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.productService.getCategories().subscribe(c => (this.categories = c));

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.productId = +id;
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: p => {
          this.form.patchValue(p);
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      shortDescription: [''],
      price: [0, [Validators.required, Validators.min(1)]],
      salePrice: [null],
      sku: ['', Validators.required],
      stockQuantity: [0],
      categoryId: [null, Validators.required],
      fabric: [''],
      care: [''],
      isFeatured: [false],
      isBestSeller: [false],
      isNew: [true],
      isActive: [true]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;
    // In a real implementation this would call the API
    // For now we show a success toast
    setTimeout(() => {
      this.toastService.success(this.isEdit ? 'Product updated!' : 'Product created!');
      this.isSaving = false;
      this.router.navigate(['/admin/products']);
    }, 800);
  }

  fieldError(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }
}
