import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { BuyerProfilesComponent } from './buyer-profiles/buyer-profiles.component';
import { AdminSettingsComponent } from './admin-settings/admin-settings.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '',                  component: AdminDashboardComponent },
      { path: 'products',          component: ProductListComponent    },
      { path: 'products/new',      component: ProductFormComponent    },
      { path: 'products/:id/edit', component: ProductFormComponent    },
      { path: 'orders',            component: OrderListComponent      },
      { path: 'orders/:id',        component: OrderDetailComponent    },
      { path: 'buyers',            component: BuyerProfilesComponent  },
      { path: 'settings',          component: AdminSettingsComponent  }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
