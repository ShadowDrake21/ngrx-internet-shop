import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faGoogle,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { filter, pairwise } from 'rxjs';
import { RoutingService } from '../../core/services/routing.service';
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent implements OnInit {
  private store = inject(Store<AppState>);
  private routingService = inject(RoutingService);
  private router = inject(Router);

  facebookIcon = faFacebookF;
  googleIcon = faGoogle;
  xIcon = faXTwitter;
  close = faClose;

  previousRoute!: string;

  ngOnInit(): void {
    this.previousRoute = this.routingService.getPreviousUrl() ?? '/';
  }

  onClose() {
    this.router.navigate([this.previousRoute]);
  }
}
