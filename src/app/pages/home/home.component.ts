import { Component } from '@angular/core';
import { IBreadcrumbs } from '../../shared/models/breadcrumbs.model';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BreadcrumbsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  breadcrumbs: IBreadcrumbs = {
    links: [],
    current: 'Home',
  };
}
