import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IProduct } from '@app/shared/models/product.model';
import { ClearURLPipe } from '@app/shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@app/shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-readonly-cart-item',
  standalone: true,
  imports: [CommonModule, TruncateTextPipe, ClearURLPipe, SafeHTMLPipe],
  templateUrl: './readonly-cart-item.component.html',
  styleUrl: './readonly-cart-item.component.scss',
})
export class ReadonlyCartItemComponent {
  @Input({ required: true }) product!: IProduct;
}
