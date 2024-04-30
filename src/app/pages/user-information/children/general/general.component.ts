import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { IStoreUserCredential, IUser } from '@app/shared/models/user.model';
import { UserState } from '@app/store/user/user.reducer';
import { Store } from '@ngrx/store';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { Observable } from 'rxjs';

import * as UserSelectors from '@store/user/user.selectors';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [
    CommonModule,
    AccordionModule,
    TabsModule,
    TruncateTextPipe,
    BasicCardComponent,
  ],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnInit {
  private store = inject(Store<UserState>);

  user$!: Observable<IUser | null>;

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
  }
}
