// angular stuff
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

// interfaces
import { IProduct } from '../../models/product.model';

// pipes
import { SafeHTMLPipe } from '../../pipes/safe-html.pipe';
import { ClearURLPipe } from '../../pipes/clear-url.pipe';
import { TruncateTextPipe } from '../../pipes/truncate-text.pipe';

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
  @Input({ required: true, alias: 'isInCart' }) isAlreadyInCart: boolean =
    false;

  @Output('onAddToCart') onAdd: EventEmitter<IProduct> =
    new EventEmitter<IProduct>();

  onAddToCart() {
    this.onAdd.emit(this.product);
  }
}