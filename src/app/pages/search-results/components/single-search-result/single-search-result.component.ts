import { Component, Input } from '@angular/core';
import { IProduct } from '../../../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { CarouselConfig, CarouselModule } from 'ngx-bootstrap/carousel';
import { RouterLink } from '@angular/router';
import { SafeHTMLPipe } from '../../../../shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '../../../../shared/pipes/clear-url.pipe';

@Component({
  selector: 'app-single-search-result',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
  ],
  templateUrl: './single-search-result.component.html',
  styleUrl: './single-search-result.component.scss',
  providers: [
    {
      provide: CarouselConfig,
      useValue: { interval: 2500, noPause: true, showIndicators: true },
    },
  ],
})
export class SingleSearchResultComponent {
  @Input({ alias: 'item', required: true }) product!: IProduct;
}
