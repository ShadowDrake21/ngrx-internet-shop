// angular stuff
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import emailjs from '@emailjs/browser';
import { CommonModule } from '@angular/common';
import { from } from 'rxjs';

// components
import { AlertComponent } from '@shared/components/alert/alert.component';

// models
import { AlertType } from '@models/alerts.model';
import { ContactUsForm } from './types/form.types';
import { FormErrorMessagesComponent } from './components/form-error-messages/form-error-messages.component';
import { FormAuthorInfoComponent } from './components/form-author-info/form-author-info.component';
import { environment } from 'environments/environment.development';

@Component({
  selector: 'home-contact-us',
  imports: [
    CommonModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    AlertComponent,
    FormErrorMessagesComponent,
    FormAuthorInfoComponent,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss',
})
export class ContactUsComponent {
  private readonly emailJsConfig = environment.emailjs;

  readonly contactUsForm: ContactUsForm = this.createContactForm();
  alerts: AlertType[] = [];

  onFormSubmit() {
    this.clearExistingAlerts();

    emailjs.init(this.emailJsConfig.publicKey);

    const emailParams = this.createEmailParams();

    from(
      emailjs.send(
        this.emailJsConfig.serviceId,
        this.emailJsConfig.templateId,
        emailParams
      )
    ).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
      complete: () => this.resetForm(),
    });
  }

  private createContactForm(): ContactUsForm {
    return new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(50),
      ]),
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
  }

  private createEmailParams() {
    const { name, email, subject, message } = this.contactUsForm.value;
    return {
      from_name: name ?? '',
      to_name: 'Demetriusz',
      from_email: email ?? '',
      subject: subject ?? '',
      message: message ?? '',
    };
  }

  private createAlert(type: 'success' | 'danger', msg: string): AlertType {
    return { type, msg, timeout: 5000 };
  }

  private handleSuccess(): void {
    this.alerts.push(
      this.createAlert('success', 'A message was successfully sent!')
    );
  }

  private handleError(): void {
    this.alerts.push(
      this.createAlert(
        'danger',
        'There happened some error! Try one more time!'
      )
    );
  }

  private clearExistingAlerts(): void {
    if (this.alerts.length) {
      this.alerts = [];
    }
  }

  private resetForm(): void {
    this.contactUsForm.reset();
  }
}
