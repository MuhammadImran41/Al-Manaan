import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { ProfileComponent } from './profile/profile.component';
import { OrderHistoryComponent } from './order-history/order-history.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ProfileComponent, OrderHistoryComponent, WishlistComponent],
  imports: [CommonModule, AccountRoutingModule, SharedModule]
})
export class AccountModule {}
