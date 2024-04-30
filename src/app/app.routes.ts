import { Routes } from '@angular/router';
import { GeneralComponent } from './pages/user-information/children/general/general.component';
import { PersonalInformationComponent } from './pages/user-information/children/personal-information/personal-information.component';
import { PurchesesComponent } from './pages/user-information/children/purcheses/purcheses.component';
import { DeliveryDetailsComponent } from './pages/user-information/children/delivery-details/delivery-details.component';
import { CardDetailsComponent } from './pages/user-information/children/card-details/card-details.component';
import { FavoriteProductsComponent } from './pages/user-information/children/favorite-products/favorite-products.component';

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
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category.component').then(
        (c) => c.CategoryComponent
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
    path: 'user-information',
    loadComponent: () =>
      import('./pages/user-information/user-information.component').then(
        (c) => c.UserInformationComponent
      ),
    children: [
      { path: '', redirectTo: 'general', pathMatch: 'full' },
      { path: 'general', component: GeneralComponent },
      { path: 'personal-information', component: PersonalInformationComponent },
      { path: 'purcheses', component: PurchesesComponent },
      { path: 'delivery-details', component: DeliveryDetailsComponent },
      { path: 'card-details', component: CardDetailsComponent },
      { path: 'favorite-products', component: FavoriteProductsComponent },
    ],
  },
];
