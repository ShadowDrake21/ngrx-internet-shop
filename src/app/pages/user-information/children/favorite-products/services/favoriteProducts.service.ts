import { inject, Injectable } from '@angular/core';
import { IProduct } from '@app/shared/models/product.model';
import { IFavoriteCategory } from '../types/favorite-products.types';
import { WINDOW } from '@app/core/providers/window.provider';

@Injectable({
  providedIn: 'root',
})
export class FavoriteProductsService {
  private readonly window = inject(WINDOW);
  private readonly mobileBreakpoint: number = 600;
  private readonly desktopBreakpoint: number = 1400;
  private readonly commonCategory = 'Common Category';

  adjustItemsPerSlide(): number {
    const { innerWidth } = this.window;

    if (innerWidth < this.mobileBreakpoint) return 1;
    if (innerWidth < this.desktopBreakpoint) return 2;
    return 3;
  }

  reorganizeCategories(categories: IFavoriteCategory): IFavoriteCategory {
    return Object.entries(categories).reduce(
      (acc, [categoryName, products]) => {
        if (products.length === 1) {
          acc[this.commonCategory] = [
            ...(acc[this.commonCategory] || []),
            ...products,
          ];
        } else {
          acc[categoryName] = products;
        }
        return acc;
      },
      {} as IFavoriteCategory
    );
  }

  setFavoriteProductInCategory(
    categories: IFavoriteCategory,
    product: IProduct
  ): IFavoriteCategory {
    const categoryName = product.category.name;
    return {
      ...categories,
      [categoryName]: [...(categories[categoryName] || []), product],
    };
  }

  setVisibleCategories(
    allCategories: IFavoriteCategory,
    startItem: number,
    endItem: number
  ): IFavoriteCategory {
    return Object.entries(allCategories)
      .slice(startItem, endItem)
      .reduce(
        (acc, [categoryName, products]) => ({
          ...acc,
          [categoryName]: products,
        }),
        {}
      );
  }
}
