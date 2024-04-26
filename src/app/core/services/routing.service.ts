import { inject, Injectable, OnInit } from '@angular/core';
import { NavigationEnd, Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoutingService {
  private router = inject(Router);
  private previousUrl!: string;

  constructor() {
    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousUrl = events[0].urlAfterRedirects;
      });
  }

  public getPreviousUrl() {
    return this.previousUrl;
  }

  public goToPreviousPage(page: string = this.previousUrl) {
    this.router.navigate([page]);
  }
}
