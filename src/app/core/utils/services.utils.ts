// interfaces
import { IProduct } from '@models/product.model';

export const mapQuantity = (products: IProduct[]): IProduct[] => {
  return products.map((product) => ({ ...product, quantity: 1 }));
};
