import { Component } from '@angular/core';
import { IBreadcrumbs } from '@shared/models/breadcrumbs.model';
import { BreadcrumbsComponent } from '@shared/components/breadcrumbs/breadcrumbs.component';
import { CommonModule } from '@angular/common';
import { ProductSliderComponent } from './components/product-slider/product-slider.component';
import { SponsorsComponent } from './components/sponsors/sponsors.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbsComponent,
    ProductSliderComponent,
    SponsorsComponent,
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
