// angular stuff
import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IBreadcrumb } from '@app/shared/models/breadcrump.model';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly breadcrumbs$$ = new BehaviorSubject<IBreadcrumb[]>([]);
  public readonly breadcrumbs$ = this.breadcrumbs$$.asObservable();

  constructor() {
    this.initializeBreadcrumbTracking();
  }

  private initializeBreadcrumbTracking(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe(() => {
        const breadcrumbs = this.buildBreadcrumbHierarchy(
          this.activatedRoute.root
        );
        this.breadcrumbs$$.next(breadcrumbs);
      });
  }

  private buildBreadcrumbHierarchy(
    route: ActivatedRoute,
    currentUrl: string = '',
    breadcrumbs: IBreadcrumb[] = []
  ): IBreadcrumb[] {
    const childRoutes: ActivatedRoute[] = route.children;

    if (childRoutes.length === 0) {
      return breadcrumbs;
    }

    for (const childRoute of childRoutes) {
      const routePath: string = this.getRoutePath(childRoute);
      const newUrl = routePath ? `${currentUrl}/${routePath}` : currentUrl;

      const breadcrumbLabel = this.resolveBreadcrumbLabel(childRoute);
      if (breadcrumbLabel) {
        breadcrumbs.push({
          label: breadcrumbLabel,
          url: newUrl,
        });
      }

      return this.buildBreadcrumbHierarchy(childRoute, newUrl, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getRoutePath(route: ActivatedRoute): string {
    return route.snapshot.url.map((segment) => segment.path).join('/');
  }

  private resolveBreadcrumbLabel(route: ActivatedRoute): string {
    const breadcrumbTemplate = route.snapshot.data['breadcrumb'];
    if (!breadcrumbTemplate) {
      return '';
    }

    return this.substituteRouteParams(
      breadcrumbTemplate,
      route.snapshot.params
    );
  }

  private substituteRouteParams(
    template: string,
    params: Record<string, string>
  ): string {
    return Object.keys(params).reduce((result, key) => {
      return result.replace(`:${key}`, params[key]);
    }, template);
  }
}
