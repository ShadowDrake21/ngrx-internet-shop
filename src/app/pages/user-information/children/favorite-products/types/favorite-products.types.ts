import { IProduct } from '@app/shared/models/product.model';

export type IFavoriteCategory = {
  [categoryName: string]: IProduct[];
};
