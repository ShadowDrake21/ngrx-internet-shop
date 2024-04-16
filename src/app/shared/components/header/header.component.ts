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
import { CommonModule } from '@angular/common';
import { CartModalComponent } from './components/cart-modal/cart-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [BsModalService],
})
export class HeaderComponent {
  private modalService = inject(BsModalService);

  cart = faCartShopping;
  signIn = faSignInAlt;
  signOut = faSignOutAlt;
  profile = faUserAlt;

  bsModalRef?: BsModalRef;

  openModalWithComponent() {
    const initialState: ModalOptions = {
      initialState: {
        list: [
          'Open a modal with component',
          'Pass your data',
          'Do something else',
          '...',
        ],
        title: 'Modal with component',
      },
    };
    this.bsModalRef = this.modalService.show(CartModalComponent, initialState);
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}
