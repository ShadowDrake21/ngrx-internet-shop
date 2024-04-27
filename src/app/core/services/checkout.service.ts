// angular stuff
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { IProduct } from '../../shared/models/product.model';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);

  checkoutInit(products: IProduct[]): Observable<any> {
    return this.http.post('http://localhost:4242/checkout', {
      items: products,
    });
  }
}
