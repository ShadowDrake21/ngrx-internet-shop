import { createReducer, on } from '@ngrx/store';

// interfaces
import { IProduct } from '../../shared/models/product.model';

// actions
import * as CartActions from './cart.actions';

export interface CartState {
  products: IProduct[];
  totalPrice: number;
}

export const initialCartState: CartState = {
  products: [],
  totalPrice: 0,
};

export const cartReducer = createReducer(
  initialCartState,
  on(CartActions.addToCart, (state, { product }) => {
    const updatedProducts =
      state.products.length < 50
        ? [...state.products, product]
        : [...state.products];
    return {
      ...state,
      products: updatedProducts,
      totalPrice: calcTotalCartPrice(updatedProducts),
    };
  }),
  on(CartActions.increaseCountProduct, (state, { productId }) => {
    const updatedProducts = state.products.map((product) =>
      product.id === productId
        ? {
            ...product,
            quantity:
              product.quantity < 99 ? product.quantity + 1 : product.quantity,
          }
        : product
    );

    return {
      ...state,
      products: updatedProducts,
      totalPrice: calcTotalCartPrice(updatedProducts),
    };
  }),
  on(CartActions.decreaseCountProduct, (state, { productId }) => {
    const updatedProducts = state.products.map((product) =>
      product.id === productId
        ? {
            ...product,
            quantity:
              product.quantity > 1 ? product.quantity - 1 : product.quantity,
          }
        : product
    );
    return {
      ...state,
      products: updatedProducts,
      totalPrice: calcTotalCartPrice(updatedProducts),
    };
  }),
  on(CartActions.removeProductFromCart, (state, { productId }) => {
    const updatedProducts = state.products.filter(
      (product) => product.id !== productId
    );
    return {
      ...state,
      products: updatedProducts,
      totalPrice: calcTotalCartPrice(updatedProducts),
    };
  })
);

export function calcTotalCartPrice(products: IProduct[]): number {
  const totalCartPrice = products.reduce(
    (accumulator, product) => accumulator + product.price * product.quantity,
    0
  );

  return totalCartPrice;
}
