import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (c) => c.ProductsComponent
      ),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (c) => c.ProductComponent
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (c) => c.CategoriesComponent
      ),
  },
  {
    path: 'search-results',
    loadComponent: () =>
      import('./pages/search-results/search-results.component').then(
        (c) => c.SearchResultsComponent
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (c) => c.CheckoutComponent
      ),
  },
];
