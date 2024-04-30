import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';

@Component({
  selector: 'app-favorite-products',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.scss',
})
export class FavoriteProductsComponent {}
