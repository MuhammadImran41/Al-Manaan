import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

// ── Static data ──────────────────────────────────────────────────────────────
const SUBCATEGORIES: Record<string, string[]> = {
  Women: [
    'Lawn Collection',
    'Shalwar Kameez',
    'Formal Wear',
    'Party Wear',
    'Casual Wear',
    'Bridal Collection',
    'Winter Collection',
    'Summer Collection',
    'Embroidered Collection',
    'Printed Collection'
  ],
  Men: [
    'Kurta Shalwar',
    'Casual Kurta',
    'Formal Wear',
    'Wash & Wear',
    'Cotton Collection',
    'Khaddar Collection',
    'Linen Collection',
    'Winter Collection',
    'Summer Collection',
    'Embroidered Kurta'
  ]
};

const FABRIC_TYPES: Record<string, string[]> = {
  Women: [
    'Lawn',
    'Chiffon',
    'Silk',
    'Cotton',
    'Georgette',
    'Organza',
    'Net',
    'Khaddar',
    'Linen',
    'Karandi',
    'Velvet',
    'Tissue'
  ],
  Men: [
    'Wash & Wear',
    'Cotton',
    'Khaddar',
    'Linen',
    'Karandi',
    'Silk',
    'Blended',
    'Wool',
    'Malmal',
    'Lawn'
  ]
};

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['../admin-dashboard/admin-dashboard.component.scss']
})
export class ProductFormComponent implements OnInit {
  form!: FormGroup;
  allCategories: Category[] = [];
  isLoading = false;
  isSaving  = false;
  isEdit    = false;
  productId: number | null = null;

  // Cascading dropdown state
  selectedGender: 'Women' | 'Men' | '' = '';
  subCategories: string[] = [];
  fabricTypes:   string[] = [];
  showCustomSubCat = false;
  showCustomFabric = false;

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
    this.productService.getCategories().subscribe(c => (this.allCategories = c));

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit    = true;
      this.productId = +id;
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: p => {
          this.form.patchValue(p);
          // Set gender from category
          const cat = this.allCategories.find(c => c.id === p.categoryId);
          if (cat) this.onGenderChange(cat.gender as 'Women' | 'Men');
          const mainImg  = p.images?.find((i: any) => i.isMain);
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
      gender:           ['', Validators.required],
      subCategory:      [''],
      categoryId:       [null, Validators.required],
      fabric:           [''],
      fabricType:       [''],
      care:             [''],
      stitchType:       ['Unstitched'],
      imageUrl:         [''],
      imageUrl2:        [''],
      isFeatured:       [false],
      isBestSeller:     [false],
      isNew:            [true],
      isActive:         [true]
    });
  }

  // ── Gender change → update subcategory + fabric lists + reset categoryId ──
  onGenderChange(gender: 'Women' | 'Men'): void {
    this.selectedGender    = gender;
    this.subCategories     = SUBCATEGORIES[gender] || [];
    this.fabricTypes       = FABRIC_TYPES[gender]  || [];
    this.showCustomSubCat  = false;
    this.showCustomFabric  = false;
    this.form.get('subCategory')?.setValue('');
    this.form.get('fabricType')?.setValue('');

    const match = this.allCategories.find(
      c => c.gender === gender && !c.parentCategoryId
    );
    if (match) this.form.get('categoryId')?.setValue(match.id);
  }

  // ── Sub-category select ──
  onSubCatSelect(value: string): void {
    if (value === '__custom__') {
      this.showCustomSubCat = true;
      this.form.get('subCategory')?.setValue('');
    } else {
      this.showCustomSubCat = false;
      this.form.get('subCategory')?.setValue(value);
      this.onSubCategoryChange(value);
    }
  }

  // ── Fabric type select ──
  onFabricTypeSelect(value: string): void {
    if (value === '__custom__') {
      this.showCustomFabric = true;
      this.form.get('fabricType')?.setValue('');
    } else {
      this.showCustomFabric = false;
      this.form.get('fabricType')?.setValue(value);
    }
  }

  // ── Sub-category change → try to match DB category ──
  onSubCategoryChange(sub: string): void {
    const match = this.allCategories.find(
      c => c.name.toLowerCase() === sub.toLowerCase() &&
           c.gender === this.selectedGender
    );
    if (match) this.form.get('categoryId')?.setValue(match.id);
  }

  generateSku(): string {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    const ts     = Date.now().toString().slice(-4);
    return `ALM-${random}-${ts}`;
  }

  onImageUrlChange(url: string):  void { this.imagePreview  = url || null; }
  onImage2UrlChange(url: string): void { this.imagePreview2 = url || null; }

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
    if (file.size > 5 * 1024 * 1024) { this.toastService.error('File too large — max 5MB'); return; }
    if (slot === 1) { this.isUploading  = true; this.uploadProgress  = 0; }
    else            { this.isUploading2 = true; this.uploadProgress2 = 0; }

    const interval = setInterval(() => {
      if (slot === 1) { if (this.uploadProgress  < 90) this.uploadProgress  += 10; }
      else            { if (this.uploadProgress2 < 90) this.uploadProgress2 += 10; }
    }, 80);

    const reader = new FileReader();
    reader.onload = (e) => {
      clearInterval(interval);
      const url = e.target?.result as string;
      if (slot === 1) {
        this.uploadProgress = 100;
        setTimeout(() => { this.imagePreview = url; this.form.get('imageUrl')?.setValue(url); this.isUploading = false; this.uploadProgress = 0; }, 300);
      } else {
        this.uploadProgress2 = 100;
        setTimeout(() => { this.imagePreview2 = url; this.form.get('imageUrl2')?.setValue(url); this.isUploading2 = false; this.uploadProgress2 = 0; }, 300);
      }
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving = true;

    const payload = { ...this.form.value };
    if (!payload.salePrice) delete payload.salePrice;
    // Merge fabricType into fabric if set
    if (payload.fabricType && !payload.fabric) payload.fabric = payload.fabricType;
    delete payload.imageUrl; delete payload.imageUrl2;
    delete payload.gender; delete payload.subCategory; delete payload.fabricType;

    // Remove null/undefined fields that API doesn't accept
    if (!payload.slug) delete payload.slug;
    if (!payload.shortDescription) delete payload.shortDescription;
    if (!payload.care) delete payload.care;

    console.log('Submitting product:', JSON.stringify(payload));

    const apiUrl = `${environment.apiUrl}/products`;
    const img1   = this.form.get('imageUrl')?.value;
    const img2   = this.form.get('imageUrl2')?.value;

    if (this.isEdit && this.productId) {
      this.http.put(`${apiUrl}/${this.productId}`, payload).subscribe({
        next: () => this.saveImages(this.productId!, img1, img2, true),
        error: (e) => this.onError(e)
      });
    } else {
      this.http.post(apiUrl, payload).subscribe({
        next: (res: any) => this.saveImages(res?.id, img1, img2, false),
        error: (e) => this.onError(e)
      });
    }
  }

  private saveImages(productId: number, img1: string, img2: string, isEdit: boolean): void {
    const apiUrl = `${environment.apiUrl}/products`;
    const calls: Promise<void>[] = [];
    if (img1) calls.push(this.http.post(`${apiUrl}/${productId}/images/url`, { imageUrl: img1, isMain: true,  sortOrder: 1 }).toPromise().then(() => {}));
    if (img2) calls.push(this.http.post(`${apiUrl}/${productId}/images/url`, { imageUrl: img2, isMain: false, sortOrder: 2 }).toPromise().then(() => {}));
    Promise.allSettled(calls).then(() => this.onSuccess(isEdit ? 'Product updated!' : 'Product created!'));
    if (calls.length === 0) this.onSuccess(isEdit ? 'Product updated!' : 'Product created!');
  }

  private onSuccess(msg: string): void {
    this.toastService.success(msg);
    this.isSaving = false;
    this.router.navigate(['/admin/products']);
  }

  private onError(e: any): void {
    this.isSaving = false;
    this.toastService.error(e?.error?.message || e?.error?.title || 'Failed to save product');
  }

  fieldError(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }
}
