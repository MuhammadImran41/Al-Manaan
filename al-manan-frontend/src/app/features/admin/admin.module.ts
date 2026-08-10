import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { BuyerProfilesComponent } from './buyer-profiles/buyer-profiles.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminPaymentsComponent } from './admin-payments/admin-payments.component';
import { AdminInventoryComponent } from './admin-inventory/admin-inventory.component';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    ProductListComponent,
    ProductFormComponent,
    OrderListComponent,
    OrderDetailComponent,
    BuyerProfilesComponent,
    AdminSettingsComponent,
    AdminPaymentsComponent,
    AdminInventoryComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AdminRoutingModule,
    SharedModule
  ]
})
export class AdminModule {}
