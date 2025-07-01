import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WindowToken', {
  providedIn: 'root',
  factory: () => {
    if (typeof window === 'undefined') {
      return window;
    }

    return {} as Window;
  },
});
