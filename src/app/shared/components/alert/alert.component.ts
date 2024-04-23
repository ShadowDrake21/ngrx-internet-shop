import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AlertType } from '../../models/alerts.model';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, AlertModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent implements OnChanges {
  @Input({ required: true }) alerts: AlertType[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['alerts']) {
      console.log('alerts', this.alerts);
    }
  }
  onClosed(dismissedAlert: AlertType): void {
    this.alerts = this.alerts.filter((alert) => alert !== dismissedAlert);
  }
}
