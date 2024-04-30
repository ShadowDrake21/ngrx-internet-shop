import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent {}
