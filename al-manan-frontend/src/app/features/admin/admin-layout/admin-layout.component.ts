import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: number;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  currentUser$!: Observable<User | null>;

  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'dashboard',  route: '/admin',           exact: true },
    { label: 'Products',   icon: 'products',   route: '/admin/products'               },
    { label: 'Orders',     icon: 'orders',     route: '/admin/orders'                 },
    { label: 'Categories', icon: 'categories', route: '/admin/categories'             },
    { label: 'Customers',  icon: 'customers',  route: '/admin/customers'              },
  ];

  currentRoute = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
      this.isMobileSidebarOpen = false; // close on navigate
    });
    this.currentRoute = this.router.url;
  }

  isActive(item: NavItem): boolean {
    if (item.exact) return this.currentRoute === item.route;
    return this.currentRoute.startsWith(item.route);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 1024) {
      this.isMobileSidebarOpen = false;
    }
  }
}
