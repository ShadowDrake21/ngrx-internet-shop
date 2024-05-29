// angular stuff
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-bootstrap/carousel';

// interfaces
import { IProduct } from '@models/product.model';

// pipes
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-favorite-products-item',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    RouterLink,
    ClearURLPipe,
    SafeHTMLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './favorite-products-item.component.html',
  styleUrl: './favorite-products-item.component.scss',
})
export class FavoriteProductsItemComponent {
  @Input({ required: true }) product!: IProduct;
  @Input({ required: true }) inCenter: boolean = false;
}
