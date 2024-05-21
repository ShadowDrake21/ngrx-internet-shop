// angular stuff
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';

// interfaces
import { IStoreUserCredential } from './shared/models/user.model';

// components
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ExpirationModalComponent } from './shared/components/expiration-modal/expiration-modal.component';

// created ngrx stuff
import { AppState } from './store/app.state';
import * as UserActions from '@store/user/user.actions';
import * as UserSelectors from '@store/user/user.selectors';
import * as FavoritesActions from '@store/favorites/favorites.action';
import * as PurchaseSelectors from '@store/purchase/purchase.selectors';

// constants
import { LS_AUTH_ITEM_NAME } from '@core/constants/auth.constants';
import { AlertComponent } from './shared/components/alert/alert.component';
import { AlertType } from './shared/models/alerts.model';
import {
  filter,
  map,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [BsModalService],
})
export class AppComponent implements OnInit, OnDestroy {
  private store = inject(Store<AppState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);

  public headerFooterAvailable: boolean = true;

  bsModalRef?: BsModalRef;

  private destroy$$: Subject<void> = new Subject<void>();

  private loadAllFavorites!: Subscription;

  ngOnInit(): void {
    this.getUserFromLS();

    this.router.events
      .pipe(takeUntil(this.destroy$$))
      .subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          if (
            this.router.url === '/sign-in' ||
            this.router.url === '/sign-up' ||
            this.router.url.includes('/user-information')
          ) {
            this.headerFooterAvailable = false;
          } else {
            this.headerFooterAvailable = true;
          }
        }
      });
    this.store.dispatch(FavoritesActions.loadAllFavorites());
    // this.loadAllFavorites = this.store
    //   .select(UserSelectors.selectUser)
    //   .pipe(
    //     filter((user) => !!user),
    //     tap(() =>)
    //   )
    //   .subscribe();

    // this.checkExpirationTime();
  }

  getUserFromLS() {
    const userCredential: IStoreUserCredential | null = JSON.parse(
      localStorage.getItem(LS_AUTH_ITEM_NAME)!
    );

    if (userCredential) {
      this.store.dispatch(
        UserActions.browserReload({
          email: userCredential.providerData[0].email,
          userCredential,
        })
      );
    }
  }

  checkExpirationTime() {
    const userString = localStorage.getItem(LS_AUTH_ITEM_NAME);
    let user: IStoreUserCredential | null = null;
    if (userString) {
      user = JSON.parse(userString);

      if (new Date(user?.tokenResult.expirationTime!) <= new Date()) {
        localStorage.removeItem(LS_AUTH_ITEM_NAME);

        (document.querySelector('#openModalBtn') as HTMLButtonElement).click();
      }
    }
  }

  openModal() {
    this.bsModalRef = this.modalService.show(ExpirationModalComponent);
  }

  ngOnDestroy(): void {
    this.loadAllFavorites.unsubscribe();
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
