import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ReactiveFormsModule } from '@angular/forms';
import { ICard } from '@app/shared/models/card.model';
import { DatabaseService } from '@app/core/services/database.service';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';
import {
  debounceTime,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { CardItemComponent } from './components/card-item/card-item.component';
import { CardFormComponent } from './components/card-form/card-form.component';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [
    CommonModule,
    BasicCardComponent,
    FontAwesomeModule,
    ReactiveFormsModule,
    CardFormComponent,
    CardItemComponent,
  ],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent implements OnInit, OnDestroy {
  userInformationItem = userInformationContent[4];

  private store = inject(Store<AppState>);
  private databaseService = inject(DatabaseService);

  cardForEditing: ICard | null = null;
  customerId: string = '';
  sizeRestriction: number = 6;

  formEnableValue: 'enable' | 'disable' = 'enable';

  cards$!: Observable<ICard[]>;

  cardDetailsLoading: boolean = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.cardDetailsLoading = true;
    const customerSubscription = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        debounceTime(2000),
        tap(() => (this.cardDetailsLoading = false))
      )
      .subscribe((customer) => {
        if (customer) {
          this.customerId = customer.id;
          this.cards$ = this.databaseService.getAllCards(this.customerId);

          const cardsSubscription = this.cards$.subscribe((records) => {
            if (records.length >= 6) {
              this.formEnableValue = 'disable';
            }
          });

          this.subscriptions.push(cardsSubscription);
        }
      });

    this.subscriptions.push(customerSubscription);
  }

  addNewCard(newCard: ICard) {
    this.cards$ = this.cards$.pipe(
      map((existingCards) => {
        return [...existingCards, newCard];
      }),
      tap((newCardsArray) => {
        if (newCardsArray.length === 6) {
          this.formEnableValue = 'disable';
        }
      })
    );
  }

  removeCard(cardId: string) {
    const removeSubscription = this.databaseService
      .deleteCard(this.customerId, cardId)
      .subscribe(() => {
        this.cards$ = this.cards$.pipe(
          map((cards) => {
            if (cards.length === 6) {
              this.formEnableValue = 'enable';
            }
            return cards.filter((card) => card.id !== cardId);
          })
        );
      });

    this.subscriptions.push(removeSubscription);
  }

  editExistingCard(editCard: ICard) {
    this.cards$ = this.cards$.pipe(
      switchMap((cards) => {
        const cardIndex = cards.findIndex((card) => card.id === editCard.id);
        if (cardIndex !== -1) {
          const updatedCards = [...cards];
          updatedCards[cardIndex] = editCard;
          return of(updatedCards);
        } else {
          return throwError(
            () => new Error(`Card with id ${editCard.id} not found`)
          );
        }
      })
    );
  }

  handleNewCard(object: { card: ICard; mode: 'add' | 'edit' }) {
    const { card, mode } = object;
    if (mode === 'add') {
      this.addNewCard(card);
    } else {
      this.editExistingCard(card);
    }
  }

  handleEditCardRequest(cardId: string) {
    const handleEditCardRequestSubscription: Subscription = this.cards$
      .pipe(map((cards) => cards.find((card) => card.id === cardId)))
      .subscribe((card) => {
        this.cardForEditing = card!;
      });

    this.subscriptions.push(handleEditCardRequestSubscription);
  }

  handleRemoveCardRequest(cardId: string) {
    this.removeCard(cardId);
  }

  handleFormReset() {
    this.cardForEditing = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
