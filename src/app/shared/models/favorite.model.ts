import { ICategory } from './category.model';

export interface IFavoriteProduct {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  creationAt: string;
  updatedAt: string;
  category: ICategory;
  quantity: number;
  expirationTime?: string;
}
