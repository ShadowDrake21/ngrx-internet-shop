export interface IPurchaseUpdate {
  name?: string;
  description?: string;
  shipping?: {
    name: string;
    phone: string;
    address: {
      country: string;
      city: string;
      line1: string;
      line2: string;
      postal_code: string;
    };
  };
}
