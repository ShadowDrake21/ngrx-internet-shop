// angular stuff
import { inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class ProductManipulationsService {
  private sanitizer = inject(DomSanitizer);

  normalizeImage(imageUrl: string) {
    const cleanedUrl = imageUrl.replace(/^["\[]+|["\]]+$/g, '');
    const sanitizedUrl = this.sanitizer.bypassSecurityTrustUrl(cleanedUrl);
    return (sanitizedUrl as any).changingThisBreaksApplicationSecurity;
  }
}
