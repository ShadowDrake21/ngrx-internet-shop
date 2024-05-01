import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './delivery-details.component.html',
  styleUrl: './delivery-details.component.scss',
})
export class DeliveryDetailsComponent {
  userInformationItem = userInformationContent[3];
}
