import { ICategory } from './category.model';

export interface IProduct {
  favoriteId?: string;
  id: number;
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
