import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// components
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import {
  IStoreUserCredential,
  IUser,
  ProviderData,
} from './shared/models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.state';

import * as UserActions from './store/user/user.actions';
import { ExpirationModalComponent } from './shared/components/expiration-modal/expiration-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [BsModalService],
})
export class AppComponent implements OnInit {
  private store = inject(Store<AppState>);
  private router = inject(Router);
  private modalService = inject(BsModalService);

  public headerFooterAvailable: boolean = true;

  bsModalRef?: BsModalRef;

  ngOnInit(): void {
    this.getUserFromLS();

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (this.router.url === '/sign-in' || this.router.url === '/sign-up') {
          this.headerFooterAvailable = false;
        } else {
          this.headerFooterAvailable = true;
        }
      }
    });

    this.checkExpirationTime();
  }

  getUserFromLS() {
    const userCredential: IStoreUserCredential | null = JSON.parse(
      localStorage.getItem('ngrx-user-credential')!
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
    const userString = localStorage.getItem('ngrx-user-credential');
    let user: IStoreUserCredential | null = null;
    if (userString) {
      user = JSON.parse(userString);

      if (new Date(user?.tokenResult.expirationTime!) <= new Date()) {
        localStorage.removeItem('ngrx-user-credential');

        (document.querySelector('#openModalBtn') as HTMLButtonElement).click();
      }
    }
  }

  openModal() {
    this.bsModalRef = this.modalService.show(ExpirationModalComponent);
  }
}
