import { inject, Injectable, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService implements OnInit {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs: Array<{ label: string; url: string }> = [];

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(
        () =>
          (this.breadcrumbs = this.createBreadcrumbs(this.activatedRoute.root))
      );
  }

  // breadcrumbs (with ngrx?) + choosing of addresses and cards!

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

      breadcrumbs.push({ label: child.snapshot.data['breadcrumb'], url: url });
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
