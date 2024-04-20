import { IProduct } from '../../shared/models/product.model';

export const mapQuantity = (products: IProduct[]): IProduct[] => {
  return products.map((product) => ({ ...product, quantity: 1 }));
};
