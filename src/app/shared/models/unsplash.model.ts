export interface IUnsplashImageResponse {
  total: number;
  total_pages: number;
  results: any[];
}

export interface IReducedUnsplashImage {
  title: string;
  url: string;
  user: {
    name: string;
    link: string;
  };
}

export interface UserLinks {
  html: string;
}
