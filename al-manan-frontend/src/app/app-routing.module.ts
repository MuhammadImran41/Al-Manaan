import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderSuccessComponent } from './features/order-success/order-success.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'shop',
    loadChildren: () => import('./features/shop/shop.module').then(m => m.ShopModule)
  },
  {
    path: 'product',
    loadChildren: () => import('./features/product/product.module').then(m => m.ProductModule)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule)
  },
  { path: 'order-success', component: OrderSuccessComponent },
  {
    // Admin panel — has its own login at /admin/login
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  // Redirect old auth/account routes to home
  { path: 'auth',    redirectTo: '', pathMatch: 'full' },
  { path: 'account', redirectTo: '', pathMatch: 'full' },
  { path: '**',      redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
