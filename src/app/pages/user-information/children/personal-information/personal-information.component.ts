import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';
import { userInformationContent } from '../../content/user-information.content';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent {
  userInformationItem = userInformationContent[1];
}
