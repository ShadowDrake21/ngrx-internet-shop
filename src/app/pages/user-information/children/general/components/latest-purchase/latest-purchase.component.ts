import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ISupplementedCharge } from '@app/shared/models/purchase.model';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-latest-purchase',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './latest-purchase.component.html',
  styleUrl: './latest-purchase.component.scss',
})
export class LatestPurchaseComponent {
  @Input({ alias: 'latestTransaction', required: true })
  latestTransaction$!: Observable<ISupplementedCharge | null>;

  @Input({ alias: 'error', required: true }) error$!: Observable<string | null>;
}
