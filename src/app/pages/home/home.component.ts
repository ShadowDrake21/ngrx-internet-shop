import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductSliderComponent } from './components/product-slider/product-slider.component';
import { SponsorsComponent } from './components/sponsors/sponsors.component';
import { UserSidebarComponent } from './components/user-sidebar/user-sidebar.component';
import { ProductsPromotionsComponent } from './components/products-promotions/products-promotions.component';
import { ProductsCategorySliderComponent } from './components/products-category-slider/products-category-slider.component';
import { GridGalleryComponent } from './components/grid-gallery/grid-gallery.component';
import { VideoSectionComponent } from './components/video-section/video-section.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProductSliderComponent,
    SponsorsComponent,
    UserSidebarComponent,
    ProductsPromotionsComponent,
    ProductsCategorySliderComponent,
    GridGalleryComponent,
    VideoSectionComponent,
    ContactUsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
