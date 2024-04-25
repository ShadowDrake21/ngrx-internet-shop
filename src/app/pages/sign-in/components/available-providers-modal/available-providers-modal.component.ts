import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-available-providers-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './available-providers-modal.component.html',
  styleUrl: './available-providers-modal.component.scss',
})
export class AvailableProvidersModalComponent {
  public bsModalRef = inject(BsModalRef);
  availableProviders: string[] = [];

  closeBtnName?: string;
}
