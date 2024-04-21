import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IProduct } from '../../shared/models/product.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private http = inject(HttpClient);

  checkoutInit(products: IProduct[]): Observable<any> {
    return this.http.post('http://localhost:4242/checkout', {
      items: products,
    });
  }
}
