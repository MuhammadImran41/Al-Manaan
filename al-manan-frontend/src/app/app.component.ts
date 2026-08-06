import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnimateOnScrollService } from './core/services/animate-on-scroll.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Al-Manan';
  isAdminRoute = false;

  constructor(
    private router: Router,
    private aos: AnimateOnScrollService
  ) {}

  ngOnInit(): void {
    this.aos.init();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url: string = event.urlAfterRedirects || event.url || '';
      this.isAdminRoute = url.startsWith('/admin');
      window.scrollTo(0, 0);
      this.aos.observe();
    });

    this.isAdminRoute = this.router.url.startsWith('/admin');
  }
}
