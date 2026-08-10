import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.model';
import { environment } from '../../../../environments/environment';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  badge?: number;
}

interface AdminNotification {
  id: number;
  type: 'order' | 'stock';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed  = false;
  isMobileSidebarOpen = false;
  currentUser$!: Observable<User | null>;
  currentRoute = '';

  // Notifications
  showNotifications = false;
  notifications: AdminNotification[] = [];
  unreadCount = 0;

  navItems: NavItem[] = [
    { label: 'Dashboard',      icon: 'dashboard',  route: '/admin',           exact: true },
    { label: 'Products',       icon: 'products',   route: '/admin/products'               },
    { label: 'Orders',         icon: 'orders',     route: '/admin/orders'                 },
    { label: 'Buyer Profiles', icon: 'buyers',     route: '/admin/buyers'                 },
    { label: 'Settings',       icon: 'settings',   route: '/admin/settings'               },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute = e.urlAfterRedirects;
      this.isMobileSidebarOpen = false;
      this.showNotifications   = false;
    });
    this.currentRoute = this.router.url;

    // Load notifications — recent orders as notifications
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.http.get<any>(`${environment.apiUrl}/orders?pageNumber=1&pageSize=5`).subscribe({
      next: (res) => {
        const orders = res?.items || [];
        this.notifications = orders.map((o: any, i: number) => ({
          id: o.id,
          type: 'order' as const,
          title: `New Order — ${o.orderNumber}`,
          message: `PKR ${o.totalAmount?.toLocaleString()} · ${o.shippingAddress?.fullName || 'Guest'}`,
          time: this.timeAgo(o.createdAt),
          read: i > 1 // first 2 unread
        }));
        this.unreadCount = this.notifications.filter(n => !n.read).length;
      },
      error: () => {
        // Fallback — no notifications
        this.notifications = [];
        this.unreadCount   = 0;
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  markAllRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
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
    if (window.innerWidth > 1024) this.isMobileSidebarOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (this.showNotifications && !target.closest('.admin-topbar__icon-btn') && !target.closest('[style*="position:absolute"]')) {
      this.showNotifications = false;
    }
  }

  private timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return 'Just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}
