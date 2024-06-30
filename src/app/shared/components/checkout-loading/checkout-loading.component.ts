import { Component } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-checkout-loading',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './checkout-loading.component.html',
  styleUrl: './checkout-loading.component.scss',
})
export class CheckoutLoadingComponent {}
