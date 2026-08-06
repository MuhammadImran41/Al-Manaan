import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart, AddToCartRequest } from '../models/cart.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartCountSubject = new BehaviorSubject<number>(0);

  cart$ = this.cartSubject.asObservable();
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadCart(): Observable<Cart> {
    return this.http.get<Cart>(this.baseUrl).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.cartCountSubject.next(cart.totalItems);
      })
    );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.baseUrl}/items`, request).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.cartCountSubject.next(cart.totalItems);
      })
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.baseUrl}/items/${itemId}`, { quantity }).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.cartCountSubject.next(cart.totalItems);
      })
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.baseUrl}/items/${itemId}`).pipe(
      tap(cart => {
        this.cartSubject.next(cart);
        this.cartCountSubject.next(cart.totalItems);
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.baseUrl).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.cartCountSubject.next(0);
      })
    );
  }

  resetCart(): void {
    this.cartSubject.next(null);
    this.cartCountSubject.next(0);
  }
}
