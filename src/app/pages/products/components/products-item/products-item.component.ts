import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IProduct } from '../../../../shared/models/product.model';
import { RouterLink } from '@angular/router';
import { SafeHTMLPipe } from '../../../../shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '../../../../shared/pipes/clear-url.pipe';
import { TruncateTextPipe } from '../../../../shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-single-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './products-item.component.html',
  styleUrl: './products-item.component.scss',
})
export class ProductsItemComponent {
  @Input({ required: true, alias: 'item' }) product!: IProduct;
}
