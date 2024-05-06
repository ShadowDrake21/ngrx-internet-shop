// angular stuff
import { Component, inject, OnInit } from '@angular/core';
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
import * as UserActions from './store/user/user.actions';

// constants
import { LS_AUTH_ITEM_NAME } from '@core/constants/auth.constants';
import { AuthService } from '@core/authentication/auth.service';

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
  private authService = inject(AuthService);

  public headerFooterAvailable: boolean = true;

  bsModalRef?: BsModalRef;

  ngOnInit(): void {
    this.getUserFromLS();

    this.router.events.subscribe((event: any) => {
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

    this.checkExpirationTime();
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
}
