import { Component } from '@angular/core';
import { contactUsIcons } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  icons = contactUsIcons;
}
