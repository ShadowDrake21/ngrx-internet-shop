// angular stuff
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { CarouselModule } from 'ngx-bootstrap/carousel';

// interfaces
import { ISupplementedCharge } from '@models/purchase.model';

@Component({
  selector: 'app-latest-purchase',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  templateUrl: './latest-purchase.component.html',
  styleUrl: './latest-purchase.component.scss',
})
export class LatestPurchaseComponent {
  @Input({ alias: 'latestTransaction', required: true })
  latestTransaction$!: Observable<ISupplementedCharge | undefined>;

  @Input({ alias: 'error', required: true }) error$!: Observable<string | null>;
}
