// angular stuff
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

// interfaces
import { IProduct } from '@models/product.model';

// pipes
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-products-category-slider-item',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './products-category-slider-item.component.html',
  styleUrl: './products-category-slider-item.component.scss',
})
export class ProductsCategorySliderItemComponent {
  @Input({ required: true, alias: 'item' }) product!: IProduct;
}
