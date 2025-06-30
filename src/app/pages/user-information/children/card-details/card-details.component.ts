// angular stuff
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
import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// services
import { DatabaseService } from '@core/services/database.service';

// interfaces and types
import { ICard } from '@models/card.model';

// content
import { userInformationContent } from '../../content/user-information.content';

// created ngrx stuff
import { AppState } from '@app/store/app.state';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// components
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { CardItemComponent } from './components/card-item/card-item.component';
import { CardFormComponent } from './components/card-form/card-form.component';

const MAX_CARDS_ALLOWED = 6;

@Component({
  selector: 'app-card-details',
  imports: [
    AsyncPipe,
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
  readonly userInformationItem = userInformationContent[4];
  readonly SIZE_RESTRICTION: number = MAX_CARDS_ALLOWED;

  private readonly store = inject(Store<AppState>);
  private readonly databaseService = inject(DatabaseService);

  cardForEditing: ICard | null = null;
  customerId: string = '';
  cards$!: Observable<ICard[]>;
  loadingState = signal({
    isLoading: true,
    showCards: false,
  });
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initCustomerSubscription();
  }

  private initCustomerSubscription(): void {
    const sub = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        debounceTime(2000),
        tap((customer) => {
          if (customer) {
            this.customerId = customer.id;
            this.loadCards();
            this.loadingState.set({
              isLoading: false,
              showCards: true,
            });
          }
        })
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  private loadCards(): void {
    this.cards$ = this.databaseService.getAllCards(this.customerId);

    const cardsSub = this.cards$.subscribe();
    this.subscriptions.push(cardsSub);
  }

  private addNewCard(newCard: ICard): void {
    this.cards$ = this.cards$.pipe(
      map((existingCards) => [...existingCards, newCard])
    );
  }

  private removeCard(cardId: string): void {
    const sub = this.databaseService
      .deleteCard(this.customerId, cardId)
      .subscribe(() => {
        this.cards$ = this.cards$.pipe(
          map((cards) => cards.filter((card) => card.id !== cardId))
        );
      });

    this.subscriptions.push(sub);
  }

  editExistingCard(editCard: ICard) {
    this.cards$ = this.cards$.pipe(
      switchMap((cards) => {
        const cardIndex = cards.findIndex((card) => card.id === editCard.id);
        if (cardIndex === -1) {
          return throwError(
            () => new Error(`Card with id ${editCard.id} not found`)
          );
        }

        const updatedCards = [...cards];
        updatedCards[cardIndex] = editCard;
        return of(updatedCards);
      })
    );
  }

  handleNewCard(event: { card: ICard; mode: 'add' | 'edit' }): void {
    event.mode === 'add'
      ? this.addNewCard(event.card)
      : this.editExistingCard(event.card);
  }

  handleEditCardRequest(cardId: string) {
    const sub = this.cards$
      .pipe(map((cards) => cards.find((card) => card.id === cardId)))
      .subscribe((card) => {
        this.cardForEditing = card ?? null;
      });

    this.subscriptions.push(sub);
  }

  handleRemoveCardRequest(cardId: string): void {
    this.removeCard(cardId);
  }

  handleFormReset() {
    this.cardForEditing = null;
  }

  get formEnableValue(): 'enable' | 'disable' {
    return this.loadingState().showCards &&
      this.cards$ &&
      this.cards$.pipe(map((cards) => cards.length >= MAX_CARDS_ALLOWED))
      ? 'disable'
      : 'enable';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
