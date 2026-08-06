import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GuestCartItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  salePrice?: number;
  quantity: number;
  size: string;
  color?: string;
  subTotal: number;
  availableStock: number;
  slug: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  subTotal: number;
  totalItems: number;
}

const CART_KEY = 'al_manan_guest_cart';

@Injectable({ providedIn: 'root' })
export class GuestCartService {
  private cartSubject = new BehaviorSubject<GuestCart>(this.load());
  cart$ = this.cartSubject.asObservable();
  private nextId = Date.now();

  private load(): GuestCart {
    try {
      const s = localStorage.getItem(CART_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    return { items: [], subTotal: 0, totalItems: 0 };
  }

  private save(cart: GuestCart): void {
    cart.subTotal   = cart.items.reduce((s, i) => s + i.subTotal, 0);
    cart.totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    this.cartSubject.next({ ...cart });
  }

  get cart(): GuestCart { return this.cartSubject.value; }
  get count(): number   { return this.cart.totalItems; }

  addItem(product: any, size: string, quantity = 1, color?: string): void {
    const cart  = this.load();
    const price = product.salePrice ?? product.price;
    const existing = cart.items.find(
      i => i.productId === product.id && i.size === size && i.color === color
    );
    if (existing) {
      existing.quantity += quantity;
      existing.subTotal  = existing.quantity * price;
    } else {
      cart.items.push({
        id:              this.nextId++,
        productId:       product.id,
        productName:     product.name,
        productImageUrl: product.mainImageUrl || 'assets/images/placeholder.svg',
        unitPrice:       product.price,
        salePrice:       product.salePrice,
        quantity,
        size,
        color,
        subTotal:        quantity * price,
        availableStock:  product.stockQuantity ?? 99,
        slug:            product.slug
      });
    }
    this.save(cart);
  }

  updateItem(itemId: number, quantity: number): void {
    const cart = this.load();
    const item = cart.items.find(i => i.id === itemId);
    if (!item) return;
    item.quantity = quantity;
    item.subTotal = quantity * (item.salePrice ?? item.unitPrice);
    this.save(cart);
  }

  removeItem(itemId: number): void {
    const cart  = this.load();
    cart.items  = cart.items.filter(i => i.id !== itemId);
    this.save(cart);
  }

  clear(): void {
    const empty: GuestCart = { items: [], subTotal: 0, totalItems: 0 };
    localStorage.removeItem(CART_KEY);
    this.cartSubject.next(empty);
  }
}
