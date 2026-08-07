import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  bestSellers: Product[]      = [];
  newArrivals: Product[]      = [];
  isLoading = true;
  newsletterEmail = '';

  currentSlide = 0;
  private slideInterval: any;

  heroSlides = [
    {
      image: 'assets/images/1.jpeg',
      eyebrow: 'New Collection · 2025',
      titleLine1: 'Crafted for',
      titleLine2: 'the Timeless.',
      subtitle: 'Rich fabrics, artisan embroidery — silhouettes that celebrate heritage.',
      cta: "Shop Women's",
      ctaLink: '/shop',
      ctaParams: { gender: 'women' },
      imgPosition: '58% 22%'
    },
    {
      image: 'assets/images/2.jpeg',
      eyebrow: 'Signature Pieces',
      titleLine1: 'Where Heritage',
      titleLine2: 'Meets Modern.',
      subtitle: 'Hand-picked fabrics, traditional craftsmanship for every occasion.',
      cta: "Explore Now",
      ctaLink: '/shop',
      ctaParams: {},
      imgPosition: '55% 18%'
    }
  ];

  marqueeItems = [
    'Premium Fabrics',
    "Artisan Embroidery",
    "Women's Collection",
    "Men's Collection",
    'New Arrivals 2025',
    'Free Delivery over PKR 3,000',
    'Handcrafted in Pakistan'
  ];

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.startSlideshow();
  }

  private loadData(): void {
    this.productService.getFeatured(8).subscribe({
      next: p => (this.featuredProducts = p),
      error: (e) => console.error('Featured error:', e)
    });
    this.productService.getBestSellers(8).subscribe({
      next: p => (this.bestSellers = p),
      error: (e) => console.error('BestSellers error:', e)
    });
    this.productService.getNewArrivals(6).subscribe({
      next: p => { this.newArrivals = p; this.isLoading = false; },
      error: (e) => { console.error('NewArrivals error:', e); this.isLoading = false; }
    });
  }

  startSlideshow(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5500);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  goToSlide(i: number): void {
    this.currentSlide = i;
  }

  subscribeNewsletter(): void {
    if (this.newsletterEmail) {
      this.toastService.success('Welcome to Al-Manan. 10% off on your way.');
      this.newsletterEmail = '';
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }
}
