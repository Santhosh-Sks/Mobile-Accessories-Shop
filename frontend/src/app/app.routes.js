import { HomeComponent } from './components/home/home.component.js';
import { ProductListComponent } from './components/product-list/product-list.component.js';

/**
 * @type {import('@angular/router').Routes}
 */
export const routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: '**', redirectTo: '' }
];
