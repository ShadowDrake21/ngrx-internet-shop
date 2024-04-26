import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AlertType } from '../../models/alerts.model';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, AlertModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input({ required: true }) alerts: AlertType[] = [];

  onClosed(dismissedAlert: AlertType): void {
    this.alerts = this.alerts.filter((alert) => alert !== dismissedAlert);
  }
}
