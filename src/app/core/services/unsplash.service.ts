import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { IUnsplashImageResponse } from '@models/unsplash.model';

// constants
import { BASE_UNSPLASH_URL } from '../constants/unsplash.constants';

// environment
import { environment } from 'environments/environment.development';

type orientationType = 'landscape' | 'portrait' | 'squarish';

@Injectable({ providedIn: 'root' })
export class UnsplashService {
  private http = inject(HttpClient);
  private readonly unsplashAccessKey = environment.unsplash.accessKey;

  getPhotoArray(
    location: string,
    orientation: orientationType = 'landscape'
  ): Observable<IUnsplashImageResponse> {
    const params = new HttpParams()
      .set('query', location)
      .set('orientation', orientation)
      .set('per_page', 30)
      .set('client_id', this.unsplashAccessKey);

    const url = BASE_UNSPLASH_URL + 'search/photos';

    return this.http.get<IUnsplashImageResponse>(url, {
      params,
    });
  }
}
