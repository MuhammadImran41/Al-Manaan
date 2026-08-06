import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product-routing.module';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ProductDetailComponent],
  imports: [CommonModule, ProductRoutingModule, SharedModule]
})
export class ProductModule {}
