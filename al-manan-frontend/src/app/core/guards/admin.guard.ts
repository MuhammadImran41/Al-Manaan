import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isLoggedIn) {
      return this.router.createUrlTree(['/admin/login']);
    }
    const user = this.authService.currentUser;
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles];
    if (!roles.some((r: any) => r === 'Admin')) {
      this.authService.logout();
      return this.router.createUrlTree(['/admin/login']);
    }
    return true;
  }
}
