import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';

@Component({
  selector: 'app-card-details',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './card-details.component.html',
  styleUrl: './card-details.component.scss',
})
export class CardDetailsComponent {
  userInformationItem = userInformationContent[4];
}
