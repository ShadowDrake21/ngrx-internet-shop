import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IProduct } from '../../../../models/product.model';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-modal.component.html',
  styleUrl: './cart-modal.component.scss',
})
export class CartModalComponent {
  title?: string;
  closeBtnName?: string;
  products: IProduct[] = [
    {
      id: 1,
      title: 'Classic Red Jogger Sweatpants',
      price: 98,
      description:
        'Experience ultimate comfort with our red jogger sweatpants, perfect for both workout sessions and lo...',
      images: ['https://i.imgur.com/9LFjwpI.jpeg'],
      creationAt: 'coś',
      updatedAt: 'coś',
      quantity: 0,
    },
  ];

  constructor(public bsModalRef: BsModalRef) {}
}
