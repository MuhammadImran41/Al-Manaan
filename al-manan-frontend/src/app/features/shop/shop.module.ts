import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopRoutingModule } from './shop-routing.module';
import { ShopComponent } from './shop/shop.component';
import { ProductFilterComponent } from './product-filter/product-filter.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ShopComponent, ProductFilterComponent],
  imports: [CommonModule, ShopRoutingModule, SharedModule]
})
export class ShopModule {}
