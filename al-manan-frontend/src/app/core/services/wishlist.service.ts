import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly baseUrl = `${environment.apiUrl}/wishlist`;
  private wishlistSubject = new BehaviorSubject<Product[]>([]);

  wishlist$ = this.wishlistSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadWishlist(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      tap(items => this.wishlistSubject.next(items))
    );
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${productId}`, {});
  }

  removeFromWishlist(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }

  isInWishlist(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${productId}/check`);
  }

  get wishlistItems(): Product[] {
    return this.wishlistSubject.value;
  }
}
