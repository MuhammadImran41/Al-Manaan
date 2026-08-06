import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 400:
            const msg = error.error?.message || error.error?.errors?.join(', ') || 'Bad request';
            this.toastService.error(msg);
            break;
          case 401:
            this.authService.logout();
            this.router.navigateByUrl('/auth/login');
            break;
          case 403:
            this.toastService.error('You do not have permission to perform this action');
            this.router.navigateByUrl('/');
            break;
          case 404:
            this.router.navigateByUrl('/not-found');
            break;
          case 500:
            this.toastService.error('A server error occurred. Please try again later.');
            break;
          default:
            this.toastService.error('An unexpected error occurred');
        }
        return throwError(() => error);
      })
    );
  }
}
