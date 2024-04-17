import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCartShopping,
  faSignInAlt,
  faSignOut,
  faSignOutAlt,
  faUserAlt,
} from '@fortawesome/free-solid-svg-icons';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { CartModalComponent } from './components/cart-modal/cart-modal.component';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducer';
import { Observable } from 'rxjs';
import { IProduct } from '../../models/product.model';
import * as CartSelectors from '../../../store/cart/cart.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [BsModalService],
})
export class HeaderComponent implements OnInit {
  private store = inject(Store<CartState>);
  private modalService = inject(BsModalService);

  cart = faCartShopping;
  signIn = faSignInAlt;
  signOut = faSignOutAlt;
  profile = faUserAlt;

  bsModalRef?: BsModalRef;

  cartProducts$!: Observable<IProduct[]>;

  ngOnInit(): void {
    this.cartProducts$ = this.store.select(CartSelectors.selectCartProducts);
  }

  openModalWithComponent() {
    const initialState: ModalOptions = {
      initialState: {
        list: [
          'Open a modal with component',
          'Pass your data',
          'Do something else',
          '...',
        ],
        title: 'My Cart',
        class: 'modal-dialog-centered',
      },
    };
    this.bsModalRef = this.modalService.show(CartModalComponent, initialState);
    this.bsModalRef.setClass('modal-dialog-centered');
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}
