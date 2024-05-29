// angular stuff
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

// interfaces
import { IProduct } from '@models/product.model';

// pipes
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

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
