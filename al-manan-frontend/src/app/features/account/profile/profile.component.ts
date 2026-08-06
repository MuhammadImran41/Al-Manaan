import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  user$;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
  }

  logout(): void { this.authService.logout(); }
}
