// angular stuff
import {
  BehaviorSubject,
  debounceTime,
  map,
  Observable,
  of,
  startWith,
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

  private cards$$ = new BehaviorSubject<ICard[]>([]);
  cards$ = this.cards$$.asObservable();
  loadingState = signal({
    isLoading: true,
    showCards: false,
  });
  formEnableValue = signal<'enable' | 'disable'>('enable');

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.initCustomerSubscription();
    this.setupFormEnableTracking();
  }

  private initCustomerSubscription(): void {
    const sub = this.store
      .select(PurchaseSelectors.selectCustomer)
      .pipe(
        debounceTime(2000),
        switchMap((customer) => {
          if (!customer) return of(null);
          this.customerId = customer.id;

          return this.databaseService.getAllCards(this.customerId).pipe(
            tap((cards) => {
              this.cards$$.next(cards);
              this.loadingState.set({ isLoading: false, showCards: true });
              this.updateFormEnableValue(cards);
            })
          );
        })
      )
      .subscribe();

    this.subscriptions.push(sub);
  }

  private setupFormEnableTracking(): void {
    const sub = this.cards$
      .pipe(tap((cards) => this.updateFormEnableValue(cards)))
      .subscribe();
    this.subscriptions.push(sub);
  }

  private updateFormEnableValue(cards: ICard[]) {
    const shouldDisable = cards.length >= MAX_CARDS_ALLOWED;
    this.formEnableValue.set(shouldDisable ? 'disable' : 'enable');
  }

  private addNewCard(newCard: ICard): void {
    const currentCards = this.cards$$.value;
    this.cards$$.next([...currentCards, newCard]);
  }

  private removeCard(cardId: string): void {
    const sub = this.databaseService
      .deleteCard(this.customerId, cardId)
      .subscribe(() => {
        const currentCards = this.cards$$.value;
        this.cards$$.next(currentCards.filter((card) => card.id !== cardId));
      });

    this.subscriptions.push(sub);
  }

  editExistingCard(editCard: ICard) {
    const currentCards = this.cards$$.value;
    const cardIndex = currentCards.findIndex((card) => card.id === editCard.id);
    if (cardIndex === -1) return;

    const updatedCards = [...currentCards];
    updatedCards[cardIndex] = editCard;
    this.cards$$.next(updatedCards);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}
