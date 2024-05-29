import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
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
import { map, noop, Observable, Observer, of, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
    FormsModule,
    TypeaheadModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [BsModalService],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  private store = inject(Store<AppState>);
  private modalService = inject(BsModalService);
  private productService = inject(ProductService);
  private router = inject(Router);

  @ViewChild('navbarToggler') navbarToggler!: ElementRef<HTMLButtonElement>;
  @ViewChild('navbarList') navbarList!: ElementRef<HTMLUListElement>;

  cart = faCartShopping;
  signIn = faSignInAlt;
  signOut = faSignOutAlt;
  profile = faUserAlt;

  bsModalRef?: BsModalRef;

  cartProducts$!: Observable<IProduct[]>;

  searchName?: string;
  suggestions$?: Observable<string[]>;
  errorMessage?: string;

  user$!: Observable<IUser | null>;
  noResult = false;

  windowSize!: number;

  ngOnInit(): void {
    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
    this.user$ = this.store.select(UserSelectors.selectUser);
    this.searchTypeahead();
  }

  ngAfterViewInit(): void {
    this.updateNavbarBehavior();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateNavbarBehavior();
  }

  private updateNavbarBehavior(): void {
    this.windowSize = window.innerWidth;
    const listEl = this.navbarList.nativeElement;
    if (this.windowSize <= 992) {
      listEl.addEventListener('click', this.handleListClick);
    } else {
      listEl.removeEventListener('click', this.handleListClick);
    }
  }

  private handleListClick = () => {
    const togglerEl = this.navbarToggler.nativeElement;
    togglerEl.click();
  };

  searchTypeahead() {
    this.suggestions$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.searchName);
      }
    ).pipe(
      switchMap((query: string) => {
        if (query) {
          return this.productService.getProductsByTitle(query).pipe(
            map(
              (products: IProduct[]) =>
                products.map((product) => product.title) || []
            ),
            tap(
              () => noop,
              (err) => {
                this.errorMessage =
                  (err && err.message) || 'Something goes wrong';
              }
            )
          );
        }

        return of([]);
      })
    );
  }

  typeaheadNoResults(event: boolean): void {
    this.noResult = event;
  }

  onSearch() {
    if (window.innerWidth <= 992) {
      this.handleListClick();
    }

    this.router.navigate(['search-results'], {
      queryParams: { query: this.searchName },
    });
    this.searchName = '';
  }

  openModalWithComponent() {
    const initialState: ModalOptions = {
      initialState: {
        title: 'My Cart',
      },
    };
    this.bsModalRef = this.modalService.show(CartModalComponent, initialState);
    this.bsModalRef.setClass('modal-dialog-centered');
    this.bsModalRef.content.closeBtnName = 'Close';
  }

  onSignIn() {
    this.router.navigate(['/sign-in']);
  }

  onSignOut() {
    this.store.dispatch(UserActions.signOut());
    localStorage.removeItem(LS_AUTH_ITEM_NAME);
  }
}
