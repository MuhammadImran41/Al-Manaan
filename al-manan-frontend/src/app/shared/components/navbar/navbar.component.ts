import {
  Component, OnInit, OnDestroy, HostListener, ElementRef
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, filter } from 'rxjs';
import { FormControl } from '@angular/forms';
import { GuestCartService } from '../../../core/services/guest-cart.service';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Always floating
  isScrolled        = true;
  isMobileMenuOpen  = false;
  isSearchOpen      = false;
  activeMega: 'women' | 'men' | null = null;
  private megaTimer: any;
  cartCount         = 0;
  searchResults: Product[] = [];
  currentUrl        = '/';
  private lastScrollY = 0;

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  womenCategories = [
    {
      label: 'Clothing',
      items: [
        { name: 'Shalwar Kameez', icon: 'dress',  params: { gender: 'women', categoryId: 3 }, badge: '' },
        { name: 'Lawn Collection', icon: 'flower', params: { gender: 'women', categoryId: 4 }, badge: 'New' },
        { name: 'Formal Wear',    icon: 'formal',  params: { gender: 'women', categoryId: 5 }, badge: '' },
        { name: "All Women's",    icon: 'arrow',   params: { gender: 'women' },               badge: '' }
      ]
    },
    {
      label: 'Shop By',
      items: [
        { name: 'New Arrivals', icon: 'sparkle', params: { gender: 'women', isNew: true },        badge: 'New' },
        { name: 'Best Sellers', icon: 'star',    params: { gender: 'women', isBestSeller: true }, badge: '' },
        { name: 'Featured',     icon: 'diamond', params: { gender: 'women', isFeatured: true },   badge: '' },
        { name: 'Sale',         icon: 'tag',     params: { gender: 'women', sortBy: 'price_asc'}, badge: 'Sale' }
      ]
    }
  ];

  menCategories = [
    {
      label: 'Clothing',
      items: [
        { name: 'Kurta Shalwar', icon: 'kurta',  params: { gender: 'men', categoryId: 6 }, badge: '' },
        { name: 'Casual Wear',   icon: 'casual',  params: { gender: 'men', categoryId: 7 }, badge: '' },
        { name: "All Men's",     icon: 'arrow',   params: { gender: 'men' },               badge: '' }
      ]
    },
    {
      label: 'Shop By',
      items: [
        { name: 'New Arrivals', icon: 'sparkle', params: { gender: 'men', isNew: true },        badge: 'New' },
        { name: 'Best Sellers', icon: 'star',    params: { gender: 'men', isBestSeller: true }, badge: '' },
        { name: 'Featured',     icon: 'diamond', params: { gender: 'men', isFeatured: true },   badge: '' },
        { name: 'Sale',         icon: 'tag',     params: { gender: 'men', sortBy: 'price_asc'}, badge: 'Sale' }
      ]
    }
  ];

  constructor(
    private guestCart: GuestCartService,
    private productService: ProductService,
    private router: Router,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Cart count
    this.guestCart.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => (this.cartCount = c.totalItems));

    // Route tracking
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e: any) => {
      this.currentUrl = e.urlAfterRedirects || e.url;
      this.closeAll();
      this.closeMega();
    });
    this.currentUrl = this.router.url;

    // Live search
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query && query.length >= 2) {
        this.productService.search(query).subscribe({
          next: r => (this.searchResults = r.slice(0, 6)),
          error: () => (this.searchResults = [])
        });
      } else {
        this.searchResults = [];
      }
    });
  }

  // Mega menu
  openMega(menu: 'women' | 'men'): void { clearTimeout(this.megaTimer); this.activeMega = menu; }
  closeMega(): void { this.megaTimer = setTimeout(() => { this.activeMega = null; }, 120); }
  keepMega(): void { clearTimeout(this.megaTimer); }
  isMegaActive(menu: 'women' | 'men'): boolean { return this.activeMega === menu; }
  navigateFromMega(params: any): void {
    this.closeMega();
    this.router.navigate(['/shop'], { queryParams: params });
  }

  @HostListener('window:scroll')
  onScroll(): void { this.lastScrollY = window.scrollY; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeAll(); this.closeMega();
    }
  }

  toggleSearch(): void {
    this.activeMega = null;
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) { this.searchControl.setValue(''); this.searchResults = []; }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeAll(): void { this.isSearchOpen = false; }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  goToSearch(): void {
    const q = this.searchControl.value?.trim();
    if (q) { this.router.navigate(['/shop'], { queryParams: { search: q } }); this.toggleSearch(); }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.megaTimer);
    document.body.style.overflow = '';
  }
}
