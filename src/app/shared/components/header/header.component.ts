import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCartShopping,
  faSignInAlt,
  faSignOutAlt,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import {
  catchError,
  map,
  noop,
  Observable,
  Observer,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

// components
import { CartModalComponent } from './components/cart-modal/cart-modal.component';

// services
import { ProductService } from '@core/services/product.service';

// intefaces
import { IProduct } from '@models/product.model';
import { IUser } from '@models/user.model';

// created ngrx stuff
import { AppState } from '@store/app.state';
import * as CartSelectors from '@store/cart/cart.selectors';
import * as UserSelectors from '@store/user/user.selectors';
import * as UserActions from '@store/user/user.actions';

// constants
import { LS_AUTH_ITEM_NAME } from '@core/constants/auth.constants';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
    FormsModule,
    TypeaheadModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [BsModalService],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly modalService = inject(BsModalService);
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('navbarToggler') navbarToggler!: ElementRef<HTMLButtonElement>;
  @ViewChild('navbarList') navbarList!: ElementRef<HTMLUListElement>;

  readonly icons = {
    cart: faCartShopping,
    signIn: faSignInAlt,
    signOut: faSignOutAlt,
    profile: faUserAlt,
  };

  bsModalRef?: BsModalRef;
  cartProducts$: Observable<IProduct[]> = this.store.select(
    CartSelectors.selectCartProducts
  );
  user$: Observable<IUser | null> = this.store.select(UserSelectors.selectUser);
  suggestions$?: Observable<string[]>;

  searchName = '';
  errorMessage = '';
  noResult = false;
  windowSize = window.innerWidth;

  ngOnInit(): void {
    this.setupSearchTypeahead();
  }

  ngAfterViewInit(): void {
    this.setupNavbarBehavior();
  }

  @HostListener('window:resize')
  onResize() {
    this.windowSize = window.innerWidth;
    this.setupNavbarBehavior();
  }

  private setupNavbarBehavior(): void {
    const listEl = this.navbarList.nativeElement;
    listEl.removeEventListener('click', this.handleListClick);

    if (this.windowSize <= 992) {
      listEl.addEventListener('click', this.handleListClick);
    }
  }

  private cleanupNavbarBehavior(): void {
    this.navbarList.nativeElement.removeEventListener(
      'click',
      this.handleListClick)
}
  private handleListClick = () => {
    this.navbarToggler.nativeElement.click();
  };

  onSearch() {
    if (!this.searchName) return;
    this.closeMobileMenuIfNeeded();
    this.navigateToSearchResults();
    this.clearSearch();
  }

  private closeMobileMenuIfNeeded(): void {
    if (this.windowSize <= 992) {
      this.handleListClick();
    }
  }

  private navigateToSearchResults(): void {
    this.router.navigate(['search-results'], {
      queryParams: { query: this.searchName },
    });
  }

  private clearSearch(): void {
    this.searchName = '';
  }

  private setupSearchTypeahead() {
    this.suggestions$ = of(this.searchName).pipe(
      switchMap((query) =>
        query ? this.getProductSuggestions(query) : of([])
      ),
      takeUntil(this.destroy$)
    );
  }

  private getProductSuggestions(query: string): Observable<string[]> {
    return this.productService.getProductsByTitle(query).pipe(
      map((products) => products.map((product) => product.title)),
      catchError((err) => {
        this.errorMessage = err?.message || 'Something goes wrong';
        return of([]);
      })
    );
  }

  typeaheadNoResults(event: boolean): void {
    this.noResult = event;
  }

  openCartModal() {
    const modalConfig: ModalOptions = {
      initialState: {
        title: 'My Cart',
      },
      class: 'modal-dialog-centered',
    };

    this.bsModalRef = this.modalService.show(CartModalComponent, modalConfig);
  }

  navigateToSignIn() {
    this.router.navigate(['/sign-in']);
  }

  signOut() {
    this.store.dispatch(UserActions.signOut());
    localStorage.removeItem(LS_AUTH_ITEM_NAME);
  }

  ngOnDestroy(): void {
    this.cleanupNavbarBehavior();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
