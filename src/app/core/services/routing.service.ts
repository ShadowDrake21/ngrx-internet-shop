// angular stuff
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, pairwise, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoutingService implements OnDestroy {
  private router = inject(Router);

  private previousUrl!: string;
  private destroy$$: Subject<void> = new Subject<void>();

  constructor() {
    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise(),
        takeUntil(this.destroy$$)
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

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
