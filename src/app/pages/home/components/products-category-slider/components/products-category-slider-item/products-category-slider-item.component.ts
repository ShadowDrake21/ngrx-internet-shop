import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IProduct } from '@app/shared/models/product.model';
import { ClearURLPipe } from '@app/shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@app/shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';

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
