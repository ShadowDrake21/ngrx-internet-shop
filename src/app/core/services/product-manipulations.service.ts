// angular stuff
import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ProductManipulationsService {
  private sanitizer = inject(DomSanitizer);

  normalizeImage(imageUrl: string) {
    return (
      this.sanitizer.bypassSecurityTrustUrl(
        imageUrl.replace(/^["\[]+|["\]]+$/g, '')
      ) as any
    ).changingThisBreaksApplicationSecurity;
  }
}
