import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  orderNumber = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.orderNumber = this.route.snapshot.queryParamMap.get('order') || '';
    if (!this.orderNumber) this.router.navigate(['/']);
  }

  goHome(): void  { this.router.navigate(['/']); }
  goShop(): void  { this.router.navigate(['/shop']); }
}
