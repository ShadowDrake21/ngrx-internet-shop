import { inject, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private breadcrumbs$$ = new BehaviorSubject<
    Array<{ label: string; url: string }>
  >([]);
  breadcrumbs$ = this.breadcrumbs$$.asObservable();

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root);
        this.breadcrumbs$$.next(breadcrumbs);
      });
  }

  // try to do the same by ngrx

  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Array<{ label: string; url: string }> = []
  ): Array<{ label: string; url: string }> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const breadcrumb = this.getBreadcrumb(child);

      if (breadcrumb) {
        breadcrumbs.push({
          label: breadcrumb,
          url: url,
        });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getBreadcrumb(route: ActivatedRoute): string {
    const breadcrumb = route.snapshot.data['breadcrumb'];
    if (!breadcrumb) {
      return '';
    }

    const paramKeys = Object.keys(route.snapshot.params);
    let dynamicBreadcrumb = breadcrumb;
    paramKeys.forEach((key) => {
      dynamicBreadcrumb = dynamicBreadcrumb.replace(
        `:${key}`,
        route.snapshot.params[key]
      );
    });

    return dynamicBreadcrumb;
  }
}
