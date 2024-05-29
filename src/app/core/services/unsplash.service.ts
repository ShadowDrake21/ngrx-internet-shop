import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { IUnsplashImageResponse } from '@models/unsplash.model';

// constants
import { BASE_UNSPLASH_URL } from '../constants/unsplash.constants';

// environment
import { environment } from 'environments/environment.development';

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  private http = inject(HttpClient);

  getPhotoArray(
    location: string,
    orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
  ): Observable<IUnsplashImageResponse> {
    return this.http.get<IUnsplashImageResponse>(
      BASE_UNSPLASH_URL + 'search/photos/',
      {
        params: new HttpParams()
          .set('query', location)
          .set('orientation', orientation)
          .set('per_page', 30)
          .set('client_id', environment.unsplash.accessKey),
      }
    );
  }
}
