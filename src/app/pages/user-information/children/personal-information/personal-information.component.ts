import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Store } from '@ngrx/store';
import { UserState } from '@app/store/user/user.reducer';
import { Observable } from 'rxjs';
import { IUser } from '@app/shared/models/user.model';

import * as UserSelectors from '@store/user/user.selectors';
import * as UserActions from '@store/user/user.actions';
import { AuthService } from '@app/core/authentication/auth.service';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [CommonModule, BasicCardComponent, NgOptimizedImage],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent implements OnInit, AfterViewInit {
  userInformationItem = userInformationContent[1];

  @ViewChild('changeImageEl') changeImageEl!: ElementRef<HTMLDivElement>;
  @ViewChild('changeImageInput')
  changeImageInput!: ElementRef<HTMLInputElement>;

  private store = inject(Store<UserState>);
  private authService = inject(AuthService);

  user$!: Observable<IUser | null>;
  userPhotoURL: string | null = null;
  areThereChanges: boolean = false;

  ngOnInit(): void {
    this.user$ = this.store.select(UserSelectors.selectUser);
    this.user$.subscribe((user) => {
      this.userPhotoURL = user?.userCredential?.providerData[0].photoURL;
    });
  }

  ngAfterViewInit(): void {
    this.changeProfileImage();
  }

  changeProfileImage() {
    const changeEl = this.changeImageEl.nativeElement;
    const changeInput = this.changeImageInput.nativeElement;

    changeEl.addEventListener('click', () => {
      changeInput.click();
    });

    changeInput.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        console.log('uploaded file: ', file);
        this.userPhotoURL = URL.createObjectURL(file);
        this.areThereChanges = true;
      }
    });
  }

  // dorobić

  onSaveChanges() {
    console.log('photo url', this.userPhotoURL);
    this.authService.updateUser({ photoURL: this.userPhotoURL! }).then(() => {
      this.store.dispatch(UserActions.getUser());
    });
    // this.store.dispatch(
    //   UserActions.updateUser({
    //     updateData: { photoURL: this.userPhotoURL! },
    //   })
    // );
  }

  onCancel() {
    this.store.dispatch(UserActions.getUser());
  }
}
