export interface ISidebarModal {
  user: {
    email: string;
    displayName: string;
    photoUrl: string;
    authTime: string;
    authExpirationTime: string;
    provider: string;
    emailVerified: boolean;
    onlineStatus: boolean;
  };
  transactions: {
    transactionsCount: number;
    transactionsPrice: number;
  };
  favoritesCount: number;
}
