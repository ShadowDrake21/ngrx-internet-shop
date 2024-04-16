import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Output('onAddToCart') onAdd: EventEmitter<IProduct> =
    new EventEmitter<IProduct>();

  protected isAlreadyInCart: boolean = false;

  onAddToCart() {
    this.onAdd.emit(this.product);
    this.isAlreadyInCart = true;
  }
}
