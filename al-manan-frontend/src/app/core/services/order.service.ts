import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderRequest } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/my-orders`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  getAllOrders(page = 1, pageSize = 15): Observable<any> {
    return this.http.get<any>(this.baseUrl, {
      params: { pageNumber: page, pageSize }
    });
  }

  updateOrderStatus(id: number, status: string, trackingNumber?: string): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}/status`, { status, trackingNumber });
  }
}
