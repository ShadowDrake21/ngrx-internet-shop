import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFacebookF,
  faGoogle,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
})
export class SignInComponent {
  facebookIcon = faFacebookF;
  googleIcon = faGoogle;
  xIcon = faXTwitter;
}
