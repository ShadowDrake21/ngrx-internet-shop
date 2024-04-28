import { Component, inject } from '@angular/core';
import { IBreadcrumbs } from '@shared/models/breadcrumbs.model';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';
import { CommonModule } from '@angular/common';
import { ProductSliderComponent } from './components/product-slider/product-slider.component';
import { SponsorsComponent } from './components/sponsors/sponsors.component';
import { UserSidebarComponent } from './components/user-sidebar/user-sidebar.component';
import { ProductsItemComponent } from '@app/shared/components/products-item/products-item.component';
import { AuthService } from '@app/core/authentication/auth.service';
import { ProductsPromotionsComponent } from './components/products-promotions/products-promotions.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    ProductSliderComponent,
    SponsorsComponent,
    UserSidebarComponent,
    ProductsPromotionsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  breadcrumbs: IBreadcrumbs = {
    links: [],
    current: 'Home',
  };
}
