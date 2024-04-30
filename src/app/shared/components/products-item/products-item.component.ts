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
  @Input({ alias: 'isInCart' }) isAlreadyInCart: boolean = false; // change to store manipulation
  @Input() showAddBtn: boolean = true;
  @Input() innerTitle!: string;

  @Output('onAddToCart') onAdd: EventEmitter<IProduct> =
    new EventEmitter<IProduct>();

  onAddToCart() {
    this.onAdd.emit(this.product);
  }
}
