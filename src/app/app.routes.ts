import { Routes } from '@angular/router';
import { GeneralComponent } from './pages/user-information/children/general/general.component';
import { PersonalInformationComponent } from './pages/user-information/children/personal-information/personal-information.component';
import { PurchasesComponent } from './pages/user-information/children/purchases/purchases.component';
import { DeliveryDetailsComponent } from './pages/user-information/children/delivery-details/delivery-details.component';
import { CardDetailsComponent } from './pages/user-information/children/card-details/card-details.component';
import { FavoriteProductsComponent } from './pages/user-information/children/favorite-products/favorite-products.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in.component').then(
        (c) => c.SignInComponent
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then(
        (c) => c.SignUpComponent
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((c) => c.HomeComponent),
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (c) => c.ProductsComponent
      ),
    data: { breadcrumb: 'Products' },
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product.component').then(
        (c) => c.ProductComponent
      ),
    data: { breadcrumb: 'Product/:id' },
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.component').then(
        (c) => c.CategoriesComponent
      ),
    data: { breadcrumb: 'Categories' },
  },
  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category.component').then(
        (c) => c.CategoryComponent
      ),
    data: { breadcrumb: 'Category' },
  },
  {
    path: 'search-results',
    loadComponent: () =>
      import('./pages/search-results/search-results.component').then(
        (c) => c.SearchResultsComponent
      ),
    data: { breadcrumb: 'Search result' },
  },
  {
    path: 'user-information',
    loadComponent: () =>
      import('./pages/user-information/user-information.component').then(
        (c) => c.UserInformationComponent
      ),

    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      {
        path: 'general',
        component: GeneralComponent,
      },
      {
        path: 'personal-information',
        component: PersonalInformationComponent,
      },
      {
        path: 'purchases',
        component: PurchasesComponent,
      },
      {
        path: 'delivery-details',
        component: DeliveryDetailsComponent,
      },
      {
        path: 'card-details',
        component: CardDetailsComponent,
      },
      {
        path: 'favorite-products',
        component: FavoriteProductsComponent,
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
