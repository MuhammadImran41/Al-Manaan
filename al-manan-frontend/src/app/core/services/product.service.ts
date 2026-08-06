import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse, ProductQueryParams, Category } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(params?: ProductQueryParams): Observable<ProductsResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<ProductsResponse>(this.baseUrl, { params: httpParams });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${slug}`);
  }

  getFeatured(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/featured`, {
      params: new HttpParams().set('count', count)
    });
  }

  getBestSellers(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/best-sellers`, {
      params: new HttpParams().set('count', count)
    });
  }

  getNewArrivals(count = 8): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/new-arrivals`, {
      params: new HttpParams().set('count', count)
    });
  }

  getRelated(productId: number, count = 4): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/${productId}/related`, {
      params: new HttpParams().set('count', count)
    });
  }

  search(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/search`, {
      params: new HttpParams().set('q', query)
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
