import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Not logged in → go to admin login page
    if (!this.authService.isLoggedIn) {
      return this.router.createUrlTree(['/admin/login']);
    }
    // Logged in but not admin → go to admin login page
    if (!this.authService.isAdmin) {
      this.authService.logout();
      return this.router.createUrlTree(['/admin/login']);
    }
    return true;
  }
}
