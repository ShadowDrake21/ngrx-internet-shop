import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { IProduct } from '../../../../shared/models/product.model';
import { ClearURLPipe } from '../../../../shared/pipes/clear-url.pipe';
import { SafeHTMLPipe } from '../../../../shared/pipes/safe-html.pipe';
import { TruncateTextPipe } from '../../../../shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-similar-product',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './similar-product.component.html',
  styleUrl: './similar-product.component.scss',
})
export class SimilarProductComponent {
  @Input({ alias: 'item', required: true }) product!: IProduct;
}
