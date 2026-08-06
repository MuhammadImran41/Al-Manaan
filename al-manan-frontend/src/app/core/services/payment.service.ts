import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentInitResponse {
  redirectUrl?: string;
  clientSecret?: string;
  transactionId: string;
  gateway: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Initiate payment for an order.
   * Returns a redirect URL (JazzCash/EasyPaisa) or client secret (Stripe).
   */
  initiatePayment(orderId: number, gateway: string): Observable<PaymentInitResponse> {
    return this.http.post<PaymentInitResponse>(
      `${this.baseUrl}/initiate/${orderId}?gateway=${gateway}`,
      {}
    );
  }

  /**
   * Redirect user to JazzCash or EasyPaisa hosted payment page.
   * Call this after initiatePayment() returns a redirectUrl.
   */
  redirectToGateway(redirectUrl: string): void {
    window.location.href = redirectUrl;
  }
}
