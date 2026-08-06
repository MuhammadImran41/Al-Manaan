import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastService } from '../../../core/services/toast.service';
import { GuestCartService } from '../../../core/services/guest-cart.service';
import { environment } from '../../../../environments/environment';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  unitPrice: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color?: string;
  subTotal: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  subTotal: number;
  totalItems: number;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm!: FormGroup;
  cart: Cart | null = null;
  isLoading = true;
  isPlacingOrder = false;
  step = 1;

  paymentMethods = [
    { value: 'cod',       label: 'Cash on Delivery',  icon: '💵', desc: 'Pay when you receive' },
    { value: 'jazzcash',  label: 'JazzCash',           icon: '📱', desc: 'Mobile wallet payment' },
    { value: 'easypaisa', label: 'EasyPaisa',          icon: '📱', desc: 'Mobile wallet payment' },
    { value: 'card',      label: 'Credit/Debit Card',  icon: '💳', desc: 'Visa, Mastercard accepted' }
  ];

  provinces = [
    'Punjab','Sindh','Khyber Pakhtunkhwa','Balochistan',
    'Islamabad Capital Territory','Gilgit-Baltistan','Azad Kashmir'
  ];

  constructor(
    private fb: FormBuilder,
    private toastService: ToastService,
    private router: Router,
    private http: HttpClient,
    private guestCart: GuestCartService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCart();
  }

  private initForm(): void {
    this.checkoutForm = this.fb.group({
      // Contact info (for guest)
      email:       ['', [Validators.required, Validators.email]],
      // Shipping address
      fullName:    ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+92|0)[0-9]{10}$/)]],
      street:      ['', Validators.required],
      city:        ['', Validators.required],
      province:    ['Punjab', Validators.required],
      postalCode:  ['', Validators.required],
      country:     ['Pakistan'],
      paymentMethod: ['cod', Validators.required],
      notes:       ['']
    });
  }

  private loadCart(): void {
    const cart = this.guestCart.cart;
    if (!cart || !cart.items?.length) {
      this.router.navigate(['/cart']);
      return;
    }
    this.cart = {
      id: 0,
      items: cart.items.map(i => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        productImageUrl: i.productImageUrl,
        unitPrice: i.unitPrice,
        salePrice: i.salePrice,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        subTotal: i.subTotal,
        availableStock: i.availableStock
      })),
      subTotal: cart.subTotal,
      totalItems: cart.totalItems
    };
    this.isLoading = false;
  }

  nextStep(): void {
    if (this.step === 1) {
      const fields = ['email','fullName','phoneNumber','street','city','province','postalCode'];
      fields.forEach(f => this.checkoutForm.get(f)?.markAsTouched());
      if (fields.every(f => this.checkoutForm.get(f)?.valid)) this.step = 2;
    } else if (this.step === 2) {
      this.step = 3;
    }
  }

  prevStep(): void { if (this.step > 1) this.step--; }

  placeOrder(): void {
    if (!this.cart?.items?.length) return;
    this.isPlacingOrder = true;
    const v = this.checkoutForm.value;

    // Build guest order payload
    const payload = {
      customerEmail:  v.email,
      customerName:   v.fullName,
      customerPhone:  v.phoneNumber,
      paymentMethod:  v.paymentMethod,
      notes:          v.notes,
      shippingAddress: {
        fullName:    v.fullName,
        phoneNumber: v.phoneNumber,
        street:      v.street,
        city:        v.city,
        province:    v.province,
        postalCode:  v.postalCode,
        country:     v.country
      },
      items: this.cart.items.map(i => ({
        productId:   i.productId,
        productName: i.productName,
        quantity:    i.quantity,
        size:        i.size,
        color:       i.color,
        unitPrice:   i.salePrice ?? i.unitPrice,
        subTotal:    i.subTotal
      })),
      subTotal:     this.subtotal,
      shippingCost: this.shippingCost,
      totalAmount:  this.total
    };

    this.http.post(`${environment.apiUrl}/GuestOrders`, payload).subscribe({
      next: (res: any) => {
        // Clear guest cart
        this.guestCart.clear();
        this.toastService.success('Order placed successfully! Check your email for confirmation.');
        this.router.navigate(['/order-success'], {
          queryParams: { order: res.orderNumber }
        });
      },
      error: () => {
        this.toastService.error('Failed to place order. Please try again.');
        this.isPlacingOrder = false;
      }
    });
  }

  get subtotal(): number {
    return this.cart?.items.reduce((s, i) => s + i.subTotal, 0) ?? 0;
  }
  get shippingCost(): number { return this.subtotal >= 3000 ? 0 : 200; }
  get total(): number { return this.subtotal + this.shippingCost; }
  get totalItems(): number { return this.cart?.items.reduce((s,i) => s + i.quantity, 0) ?? 0; }
  fieldError(f: string): boolean {
    const c = this.checkoutForm.get(f);
    return !!(c?.invalid && c.touched);
  }
}
