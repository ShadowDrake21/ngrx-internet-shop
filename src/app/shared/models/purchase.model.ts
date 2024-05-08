export interface IPurchaseUpdate {
  name?: string;
  description?: string;
  address?: {
    country: string;
    city: string;
    line1: string;
    postal_code: string;
  };
}
