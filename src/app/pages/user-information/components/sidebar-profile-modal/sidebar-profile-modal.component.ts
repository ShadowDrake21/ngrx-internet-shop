import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-sidebar-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-profile-modal.component.html',
  styleUrl: './sidebar-profile-modal.component.scss',
})
export class SidebarProfileModalComponent {
  public bsModalRef = inject(BsModalRef);
}
