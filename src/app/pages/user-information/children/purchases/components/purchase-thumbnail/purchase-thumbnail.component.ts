import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';

@Component({
  selector: 'app-purchase-thumbnail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-thumbnail.component.html',
  styleUrl: './purchase-thumbnail.component.scss',
})
export class PurchaseThumbnailComponent {
  @Input({ required: true }) transaction!: ISupplementedCharge;
}
