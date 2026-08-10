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
  isLoading  = false;
  isSaving   = false;
  isEdit     = false;
  productId: number | null = null;

  // Image 1
  imagePreview:  string | null = null;
  imageMode:  'url' | 'upload' = 'url';
  isUploading  = false;
  uploadProgress  = 0;

  // Image 2
  imagePreview2: string | null = null;
  image2Mode: 'url' | 'upload' = 'url';
  isUploading2 = false;
  uploadProgress2 = 0;

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
      this.isEdit    = true;
      this.productId = +id;
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: p => {
          this.form.patchValue(p);
          // Load existing images
          const mainImg = p.images?.find((i: any) => i.isMain);
          const hoverImg = p.images?.find((i: any) => !i.isMain);
          if (mainImg)  { this.imagePreview  = mainImg.imageUrl;  this.form.get('imageUrl')?.setValue(mainImg.imageUrl); }
          if (hoverImg) { this.imagePreview2 = hoverImg.imageUrl; this.form.get('imageUrl2')?.setValue(hoverImg.imageUrl); }
          this.isLoading = false;
        },
        error: () => (this.isLoading = false)
      });
    } else {
      this.form.get('sku')?.setValue(this.generateSku());
    }

    // Auto slug from name
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
      imageUrl2:        [''],
      isFeatured:       [false],
      isBestSeller:     [false],
      isNew:            [true],
      isActive:         [true]
    });
  }

  generateSku(): string {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ts     = Date.now().toString().slice(-4);
    return `ALM-${random}-${ts}`;
  }

  // ── Image 1 ─────────────────────────────────────────────
  onImageUrlChange(url: string): void {
    this.imagePreview = url || null;
  }

  onFileSelect(event: Event, slot: 1 | 2): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadFile(file, slot);
  }

  onFileDrop(event: DragEvent, slot: 1 | 2): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file, slot);
  }

  private uploadFile(file: File, slot: 1 | 2): void {
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File too large — max 5MB');
      return;
    }

    if (slot === 1) { this.isUploading = true;  this.uploadProgress  = 0; }
    else            { this.isUploading2 = true; this.uploadProgress2 = 0; }

    // Simulate progress while reading file
    const progressInterval = setInterval(() => {
      if (slot === 1) {
        if (this.uploadProgress  < 90) this.uploadProgress  += 10;
      } else {
        if (this.uploadProgress2 < 90) this.uploadProgress2 += 10;
      }
    }, 80);

    const reader = new FileReader();
    reader.onload = (e) => {
      clearInterval(progressInterval);
      const dataUrl = e.target?.result as string;
      if (slot === 1) {
        this.uploadProgress  = 100;
        setTimeout(() => {
          this.imagePreview  = dataUrl;
          this.form.get('imageUrl')?.setValue(dataUrl);
          this.isUploading   = false;
          this.uploadProgress = 0;
        }, 300);
      } else {
        this.uploadProgress2 = 100;
        setTimeout(() => {
          this.imagePreview2 = dataUrl;
          this.form.get('imageUrl2')?.setValue(dataUrl);
          this.isUploading2  = false;
          this.uploadProgress2 = 0;
        }, 300);
      }
    };
    reader.readAsDataURL(file);
  }

  // ── Image 2 ─────────────────────────────────────────────
  onImage2UrlChange(url: string): void {
    this.imagePreview2 = url || null;
  }

  // ── Submit ───────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;

    const payload = { ...this.form.value };
    if (!payload.salePrice) delete payload.salePrice;
    delete payload.imageUrl;
    delete payload.imageUrl2;

    const apiUrl   = `${environment.apiUrl}/products`;
    const img1     = this.form.get('imageUrl')?.value;
    const img2     = this.form.get('imageUrl2')?.value;

    if (this.isEdit && this.productId) {
      this.http.put(`${apiUrl}/${this.productId}`, payload).subscribe({
        next: () => {
          this.saveImages(this.productId!, img1, img2, true);
        },
        error: (e) => this.onError(e)
      });
    } else {
      this.http.post(apiUrl, payload).subscribe({
        next: (res: any) => {
          this.saveImages(res?.id, img1, img2, false);
        },
        error: (e) => this.onError(e)
      });
    }
  }

  private saveImages(productId: number, img1: string, img2: string, isEdit: boolean): void {
    const apiUrl = `${environment.apiUrl}/products`;
    const calls: Promise<void>[] = [];

    if (img1) {
      calls.push(
        this.http.post(`${apiUrl}/${productId}/images/url`, {
          imageUrl: img1, isMain: true, sortOrder: 1
        }).toPromise().then(() => {})
      );
    }
    if (img2) {
      calls.push(
        this.http.post(`${apiUrl}/${productId}/images/url`, {
          imageUrl: img2, isMain: false, sortOrder: 2
        }).toPromise().then(() => {})
      );
    }

    Promise.allSettled(calls).then(() => {
      this.onSuccess(isEdit ? 'Product updated!' : 'Product created!');
    });

    if (calls.length === 0) {
      this.onSuccess(isEdit ? 'Product updated!' : 'Product created!');
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
