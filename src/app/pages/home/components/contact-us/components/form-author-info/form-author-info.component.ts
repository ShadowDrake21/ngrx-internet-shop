import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { contactUsIcons } from '@shared/utils/icons.utils';

@Component({
  selector: 'contact-us-form-author-info',
  imports: [FaIconComponent],
  templateUrl: './form-author-info.component.html',
  styleUrl: './form-author-info.component.scss',
})
export class FormAuthorInfoComponent {
  readonly icons = contactUsIcons;
}
