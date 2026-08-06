import { Component } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';

  constructor(private toastService: ToastService) {}

  subscribeNewsletter(): void {
    if (this.newsletterEmail) {
      this.toastService.success('Thank you for subscribing!');
      this.newsletterEmail = '';
    }
  }
}
