import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { contactUsIcons } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import emailjs from '@emailjs/browser';
import { from } from 'rxjs';
import { AlertComponent } from '@app/shared/components/alert/alert.component';
import { AlertType } from '@app/shared/models/alerts.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    AlertComponent,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  icons = contactUsIcons;

  contactUsForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    subject: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(60),
    ]),
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(255),
    ]),
  });

  alerts: AlertType[] = [];

  onFormSubmit() {
    if (this.alerts.length) {
      this.alerts = [];
    }

    emailjs.init('IGAxW1H-zizWj4l1c');

    let response$ = from(
      emailjs.send('service_ona0hct', 'template_01f94jj', {
        from_name: this.contactUsForm.value.name,
        to_name: 'Demetriusz',
        from_email: this.contactUsForm.value.email,
        subject: this.contactUsForm.value.subject,
        message: this.contactUsForm.value.message,
      })
    );

    response$.subscribe({
      next: (value) => {
        this.alerts.push({
          type: 'success',
          msg: 'A message was successfully sent!',
          timeout: 5000,
        });
      },
      error: () => {
        this.alerts.push({
          type: 'danger',
          msg: 'There happened some error! Try one more time!',
          timeout: 5000,
        });
      },
      complete: () => {
        this.contactUsForm.reset();
      },
    });
  }
}
