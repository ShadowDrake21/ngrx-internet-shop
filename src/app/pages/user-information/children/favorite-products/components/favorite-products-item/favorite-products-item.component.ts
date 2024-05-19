import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IProduct } from '@app/shared/models/product.model';
import { ClearURLPipe } from '@app/shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@app/shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { CarouselModule } from 'ngx-bootstrap/carousel';

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
