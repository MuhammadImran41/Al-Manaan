import { Injectable, OnDestroy } from '@angular/core';

/**
 * IntersectionObserver-based scroll animation service.
 * - No GSAP, no Lenis, no RAF loops during scroll
 * - Just CSS class toggling when element enters viewport
 * - Zero scroll performance cost
 */
@Injectable({ providedIn: 'root' })
export class AnimateOnScrollService implements OnDestroy {
  private observer!: IntersectionObserver;

  init(): void {
    if (this.observer) this.observer.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-visible');
            // Unobserve after animating — fire once only
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,      // trigger when 12% visible
        rootMargin: '0px 0px -40px 0px'
      }
    );

    // Observe all elements with data-aos attribute
    this.observe();
  }

  observe(): void {
    // Small delay to let DOM settle after route change
    setTimeout(() => {
      const els = document.querySelectorAll('[data-aos]');
      els.forEach(el => {
        el.classList.remove('aos-visible');
        this.observer?.observe(el);
      });
    }, 60);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
