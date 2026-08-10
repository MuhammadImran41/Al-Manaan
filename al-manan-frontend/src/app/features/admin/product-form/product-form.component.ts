import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  isSaving  = false;
  isEdit    = false;
  productId: number | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.productService.getCategories().subscribe(c => (this.categories = c));

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit   = true;
      this.productId = +id;
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: p => {
          this.form.patchValue(p);
          this.imagePreview = p.mainImageUrl || null;
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      // Auto-generate SKU for new products
      this.form.get('sku')?.setValue(this.generateSku());
    }

    // Update slug when name changes
    this.form.get('name')?.valueChanges.subscribe(name => {
      if (!this.isEdit) {
        const slug = name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '';
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      name:             ['', [Validators.required]],
      slug:             [''],
      description:      ['', [Validators.required]],
      shortDescription: [''],
      price:            [0, [Validators.required, Validators.min(1)]],
      salePrice:        [null],
      sku:              ['', Validators.required],
      stockQuantity:    [0],
      categoryId:       [null, Validators.required],
      fabric:           [''],
      care:             [''],
      imageUrl:         [''],
      isFeatured:       [false],
      isBestSeller:     [false],
      isNew:            [true],
      isActive:         [true]
    });
  }

  generateSku(): string {
    const prefix = 'ALM';
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ts     = Date.now().toString().slice(-4);
    return `${prefix}-${random}-${ts}`;
  }

  onImageUrlChange(url: string): void {
    this.imagePreview = url || null;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;

    const payload = { ...this.form.value };
    // Remove empty salePrice
    if (!payload.salePrice) delete payload.salePrice;

    const apiUrl = `${environment.apiUrl}/products`;

    if (this.isEdit && this.productId) {
      this.http.put(`${apiUrl}/${this.productId}`, payload).subscribe({
        next: () => this.onSuccess('Product updated!'),
        error: (e) => this.onError(e)
      });
    } else {
      this.http.post(apiUrl, payload).subscribe({
        next: (res: any) => {
          // If image URL provided, save it as product image
          if (payload.imageUrl && res?.id) {
            this.http.post(`${apiUrl}/${res.id}/images/url`, {
              imageUrl: payload.imageUrl,
              isMain: true,
              sortOrder: 1
            }).subscribe();
          }
          this.onSuccess('Product created!');
        },
        error: (e) => this.onError(e)
      });
    }
  }

  private onSuccess(msg: string): void {
    this.toastService.success(msg);
    this.isSaving = false;
    this.router.navigate(['/admin/products']);
  }

  private onError(e: any): void {
    this.isSaving = false;
    const msg = e?.error?.message || e?.error?.title || 'Failed to save product';
    this.toastService.error(msg);
  }

  fieldError(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }
}
