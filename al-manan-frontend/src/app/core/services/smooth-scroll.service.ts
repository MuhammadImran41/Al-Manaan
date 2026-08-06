import { Injectable } from '@angular/core';

/**
 * Lightweight scroll service — NO Lenis, NO heavy libraries.
 * Uses native browser scrolling (fastest on Windows Chrome).
 * Provides programmatic scroll-to only.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  init(): void {
    // Nothing to init — native browser scroll handles everything
    // CSS scroll-behavior: smooth is set globally
  }

  scrollTo(target: string | number | HTMLElement, offset = 0): void {
    if (typeof target === 'number') {
      window.scrollTo({ top: target + offset, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else if (target instanceof HTMLElement) {
      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }

  pause():   void { /* no-op */ }
  resume():  void { /* no-op */ }
  destroy(): void { /* no-op */ }
}
