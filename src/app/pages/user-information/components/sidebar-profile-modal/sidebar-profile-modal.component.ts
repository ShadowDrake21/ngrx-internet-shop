// angular stuff
import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';

// interfaces
import { ISidebarModal } from '../../models/sidebar-modal.model';

// pipes
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-sidebar-profile-modal',
  imports: [DatePipe, AsyncPipe, TruncateTextPipe],
  templateUrl: './sidebar-profile-modal.component.html',
  styleUrl: './sidebar-profile-modal.component.scss',
})
export class SidebarProfileModalComponent {
  private readonly bsModalRef = inject(BsModalRef);

  onHide() {
    this.bsModalRef.hide();
  }

  profileData?: ISidebarModal;
}
