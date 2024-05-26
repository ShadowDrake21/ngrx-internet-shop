import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
export class LatestPurchaseComponent implements OnInit {
  @Input({ alias: 'latestTransaction', required: true })
  latestTransaction$!: Observable<ISupplementedCharge | undefined>;

  @Input({ alias: 'error', required: true }) error$!: Observable<string | null>;

  ngOnInit(): void {
    this.latestTransaction$.subscribe((transaction) => {
      console.log(transaction);
    });
  }
}
