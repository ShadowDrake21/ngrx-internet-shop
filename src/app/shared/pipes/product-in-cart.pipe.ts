import { inject, Pipe, PipeTransform } from '@angular/core';
import { ProductInCartService } from '@app/core/services/product-in-cart.service';
import { Observable } from 'rxjs';

@Pipe({
  name: 'productInCart',
})
export class ProductInCartPipe implements PipeTransform {
  private readonly productInCartService = inject(ProductInCartService);

  transform(productId: number): Observable<boolean> | null {
    return this.productInCartService.isProductInCart(productId);
  }
}
