// angular stuff
import { CurrencyPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';

// interfaces
import { IProduct } from '@models/product.model';

// pipes
import { SafeHTMLPipe } from '@shared/pipes/safe-html.pipe';
import { ClearURLPipe } from '@shared/pipes/clear-url.pipe';
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

// services
import { ProductManipulationsService } from '@core/services/product-manipulations.service';

// created ngrx stuff
import { UserState } from '@app/store/user/user.reducer';
import * as UserSelectors from '@store/user/user.selectors';

@Component({
  selector: 'app-single-product',
  imports: [
    TitleCasePipe,
    CurrencyPipe,
    UpperCasePipe,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './products-item.component.html',
  styleUrl: './products-item.component.scss',
})
export class ProductsItemComponent implements OnInit, OnChanges, OnDestroy {
  private readonly store = inject(Store<UserState>);
  private readonly productsService = inject(ProductManipulationsService);
  private subscription = new Subscription();

  @Input({ required: true, alias: 'item' }) product!: IProduct;
  @Input({ alias: 'isInCart' }) isAlreadyInCart: boolean = false;
  @Input() showAddBtn: boolean = false;
  @Input() innerTitle: string = '';

  @Output() productAdded = new EventEmitter<IProduct>();

  protected readonly normalizeProduct = signal<IProduct | null>(null);

  ngOnInit(): void {
    this.subscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        this.showAddBtn = !!user?.userCredential;
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.normalizeImages();
    }
  }

  normalizeImages() {
    const normalizeImages = this.product.images.map((image) =>
      this.productsService.normalizeImage(image)
    );

    this.normalizeProduct.set({
      ...this.product,
      images: normalizeImages,
    });
  }

  onAddToCart() {
    this.productAdded.emit(this.normalizeProduct() || this.product);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
