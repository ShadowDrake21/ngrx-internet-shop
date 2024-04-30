import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';

@Component({
  selector: 'app-purcheses',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './purcheses.component.html',
  styleUrl: './purcheses.component.scss',
})
export class PurchesesComponent {}
