// angular stuff
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
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
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SafeHTMLPipe,
    ClearURLPipe,
    TruncateTextPipe,
  ],
  templateUrl: './products-item.component.html',
  styleUrl: './products-item.component.scss',
})
export class ProductsItemComponent implements OnInit, OnChanges, OnDestroy {
  private store = inject(Store<UserState>);
  private productManipulationsService = inject(ProductManipulationsService);

  @Input({ required: true, alias: 'item' }) product!: IProduct;
  @Input({ alias: 'isInCart' }) isAlreadyInCart: boolean = false;
  @Input() showAddBtn: boolean = true;
  @Input() innerTitle!: string;

  @Output('onAddToCart') onAdd: EventEmitter<IProduct> =
    new EventEmitter<IProduct>();

  private userSubscription!: Subscription;

  ngOnInit(): void {
    this.userSubscription = this.store
      .select(UserSelectors.selectUser)
      .subscribe((user) => {
        if (!user?.userCredential) {
          this.showAddBtn = false;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      this.normalizeImages();
    }
  }

  normalizeImages() {
    const updatedProduct = { ...this.product };
    updatedProduct.images = updatedProduct.images.map((image) =>
      this.productManipulationsService.normalizeImage(image)
    );

    this.product = updatedProduct;
  }

  onAddToCart() {
    this.onAdd.emit(this.product);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}
