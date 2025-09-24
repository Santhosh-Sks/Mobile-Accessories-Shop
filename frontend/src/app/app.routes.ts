import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetail } from './components/product-detail/product-detail';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { LoginComponent } from './components/login/login';
import { SignupComponent } from './components/signup/signup';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: Cart, canActivate: [AuthGuard] },
  { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboard, canActivate: [AdminGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'register', redirectTo: 'signup' },
  { path: '**', redirectTo: '' }
];
