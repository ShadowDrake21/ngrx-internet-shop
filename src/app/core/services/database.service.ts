import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  update,
} from '@angular/fire/database';
import { IShipping } from '@app/shared/models/purchase.model';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database = inject(Database);

  addDeliveryRecord(
    shipping: IShipping,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return from(
      update(
        ref(
          this.database,
          `customers/${customerId}/deliveryRecords/${recordName}`
        ),
        shipping
      )
    );
  }

  getAllDeliveryRecords(customerId: string): Observable<IShipping[]> {
    return from(
      get(child(ref(this.database), `customers/${customerId}/deliveryRecords/`))
    ).pipe(
      map((snaphot: DataSnapshot) => {
        let deliveryRecords: IShipping[] = [];
        if (snaphot.exists()) {
          snaphot.forEach((childSnapshot) => {
            const shippingData = childSnapshot.val() as IShipping;
            deliveryRecords.push(shippingData);
          });
        }
        return deliveryRecords;
      })
    );
  }
}
