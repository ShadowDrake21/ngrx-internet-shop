import { inject, Injectable } from '@angular/core';
import {
  child,
  Database,
  DataSnapshot,
  get,
  ref,
  remove,
  update,
} from '@angular/fire/database';
import { ICard } from '@app/shared/models/card.model';
import { IShipping } from '@app/shared/models/purchase.model';
import { set } from 'firebase/database';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private database = inject(Database);

  setDeliveryRecord(
    shipping: IShipping,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return from(
      set(
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

  deleteDeliveryRecord(customerId: string, recordId: string): Observable<void> {
    return from(
      remove(
        ref(
          this.database,
          `customers/${customerId}/deliveryRecords/${recordId}`
        )
      )
    );
  }

  setCard(
    card: ICard,
    customerId: string,
    recordName: string
  ): Observable<void> {
    return from(
      set(
        ref(this.database, `customers/${customerId}/cards/${recordName}`),
        card
      )
    );
  }

  getAllCards(customerId: string): Observable<ICard[]> {
    return from(
      get(child(ref(this.database), `customers/${customerId}/cards/`))
    ).pipe(
      map((snaphot: DataSnapshot) => {
        let cards: ICard[] = [];
        if (snaphot.exists()) {
          snaphot.forEach((childSnapshot) => {
            const cardData = childSnapshot.val() as ICard;
            cards.push(cardData);
          });
        }
        return cards;
      })
    );
  }

  deleteCard(customerId: string, cardId: string): Observable<void> {
    return from(
      remove(ref(this.database, `customers/${customerId}/cards/${cardId}`))
    );
  }
}
